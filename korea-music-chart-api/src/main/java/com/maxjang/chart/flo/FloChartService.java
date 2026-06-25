package com.maxjang.chart.flo;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.maxjang.chart.common.ChartVO;
import org.jsoup.Connection;
import org.jsoup.Jsoup;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.time.Instant;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

@Service
public class FloChartService {

    private static final Logger logger = LoggerFactory.getLogger(FloChartService.class);
    private static final Duration REFRESH_INTERVAL = Duration.ofHours(1);

    private final ObjectMapper objectMapper = new ObjectMapper();
    private final Object cacheLock = new Object();
    private volatile List<ChartVO> cachedChart = Collections.emptyList();
    private volatile Instant lastFetchedAt = Instant.EPOCH;

    public List<ChartVO> getFloChartTop100(String artistName) throws Exception {
        List<ChartVO> chart = getOrRefreshChart();
        if (artistName == null || artistName.trim().isEmpty()) {
            return new ArrayList<>(chart);
        }

        List<ChartVO> filtered = new ArrayList<>();
        String needle = artistName.trim();
        for (ChartVO item : chart) {
            if (item != null && item.getArtistName() != null && item.getArtistName().contains(needle)) {
                filtered.add(item);
            }
        }

        return filtered;
    }

    @Scheduled(cron = "0 0 * * * *")
    public void refreshFloChartHourly() {
        try {
            refreshChart();
        } catch (Exception ex) {
            logger.warn("Failed to refresh FLO chart cache", ex);
        }
    }

    private List<ChartVO> getOrRefreshChart() throws Exception {
        if (!cachedChart.isEmpty() && isFresh()) {
            return cachedChart;
        }

        synchronized (cacheLock) {
            if (!cachedChart.isEmpty() && isFresh()) {
                return cachedChart;
            }
            refreshChart();
            return cachedChart;
        }
    }

    private boolean isFresh() {
        return Duration.between(lastFetchedAt, Instant.now()).compareTo(REFRESH_INTERVAL) < 0;
    }

    private void refreshChart() throws Exception {
        // FLO "FLO 차트" (id=1): 최근 24시간 집계, 총 100곡
        String url = "https://www.music-flo.com/api/display/v1/browser/chart/1/track/list?size=100";

        Connection.Response res = Jsoup.connect(url)
                .userAgent("Mozilla/5.0")
                .header("accept", "application/json")
                .header("accept-language", "ko-KR,ko;q=0.9,en;q=0.8")
                .ignoreContentType(true)
                .execute();

        FloRoot root = objectMapper.readValue(res.body(), FloRoot.class);
        List<FloTrack> tracks = root != null && root.data != null ? root.data.trackList : null;
        List<ChartVO> data = new ArrayList<>();
        if (tracks == null) {
            cachedChart = data;
            lastFetchedAt = Instant.now();
            return;
        }

        int chartRank = 1;
        for (FloTrack track : tracks) {
            String resolvedArtistName = resolveArtistName(track);
            String[] rankStatus = resolveRankStatus(track);

            data.add(ChartVO.builder()
                    .rank(chartRank)
                    .artistName(resolvedArtistName)
                    .title(track != null ? track.name : null)
                    .albumName(track != null && track.album != null ? track.album.title : null)
                    .albumArt(resolveAlbumArt(track))
                    .songNumber(track != null && track.id != null ? String.valueOf(track.id) : null)
                    .rankStatus(rankStatus[0])
                    .changedRank(Integer.parseInt(rankStatus[1]))
                    .build());

            chartRank++;
        }

        cachedChart = data;
        lastFetchedAt = Instant.now();
    }

    private String resolveArtistName(FloTrack track) {
        if (track == null) return null;

        if (track.representationArtist != null && track.representationArtist.name != null) {
            return track.representationArtist.name;
        }

        if (track.artistList != null && !track.artistList.isEmpty()) {
            List<String> names = new ArrayList<>();
            for (FloArtist artist : track.artistList) {
                if (artist != null && artist.name != null && !artist.name.trim().isEmpty()) {
                    names.add(artist.name.trim());
                }
            }
            if (!names.isEmpty()) return String.join(", ", names);
        }

        return null;
    }

    private String resolveAlbumArt(FloTrack track) {
        if (track == null || track.album == null) return null;

        if (track.album.img != null && track.album.img.urlFormat != null && !track.album.img.urlFormat.trim().isEmpty()) {
            return track.album.img.urlFormat.replace("{size}", "350");
        }

        if (track.album.imgList != null) {
            for (FloImage image : track.album.imgList) {
                if (image != null && image.size != null && image.size == 350 && image.url != null) {
                    return image.url;
                }
            }
        }

        return null;
    }

    private String[] resolveRankStatus(FloTrack track) {
        // rank.rankBadge: positive=up, negative=down, 0=static
        // rank.newYn: 'Y' => new
        if (track != null && track.rank != null) {
            if (isYes(track.rank.newYn)) return new String[]{"new", "0"};

            Integer badge = track.rank.rankBadge;
            if (badge == null || badge == 0) return new String[]{"static", "0"};
            if (badge > 0) return new String[]{"up", String.valueOf(badge)};
            return new String[]{"down", String.valueOf(Math.abs(badge))};
        }

        return new String[]{"static", "0"};
    }

    private boolean isYes(String value) {
        if (value == null) return false;
        String v = value.trim().toLowerCase();
        return v.equals("y") || v.equals("yes") || v.equals("true");
    }

    @JsonIgnoreProperties(ignoreUnknown = true)
    static class FloRoot {
        public FloData data;
    }

    @JsonIgnoreProperties(ignoreUnknown = true)
    static class FloData {
        public List<FloTrack> trackList;
    }

    @JsonIgnoreProperties(ignoreUnknown = true)
    static class FloTrack {
        public Long id;
        public String name;
        public FloAlbum album;
        public FloRepresentationArtist representationArtist;
        public List<FloArtist> artistList;
        public FloRank rank;
    }

    @JsonIgnoreProperties(ignoreUnknown = true)
    static class FloAlbum {
        public String title;
        public FloImg img;
        public List<FloImage> imgList;
    }

    @JsonIgnoreProperties(ignoreUnknown = true)
    static class FloImg {
        public String urlFormat;
    }

    @JsonIgnoreProperties(ignoreUnknown = true)
    static class FloImage {
        public Integer size;
        public String url;
    }

    @JsonIgnoreProperties(ignoreUnknown = true)
    static class FloArtist {
        public String name;
    }

    @JsonIgnoreProperties(ignoreUnknown = true)
    static class FloRepresentationArtist {
        public String name;
    }

    @JsonIgnoreProperties(ignoreUnknown = true)
    static class FloRank {
        public String newYn;
        public Integer rankBadge;
    }
}
