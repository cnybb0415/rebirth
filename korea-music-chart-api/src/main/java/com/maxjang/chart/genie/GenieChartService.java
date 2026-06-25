package com.maxjang.chart.genie;

import com.maxjang.chart.common.DetailVO;
import com.maxjang.chart.common.ChartVO;
import org.jsoup.Jsoup;
import org.jsoup.nodes.Document;
import org.jsoup.nodes.Element;
import org.springframework.stereotype.Service;

import java.time.ZoneId;
import java.time.ZonedDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

@Service
public class GenieChartService {
    private static final ZoneId KST = ZoneId.of("Asia/Seoul");
    private static final DateTimeFormatter GENIE_DATE = DateTimeFormatter.ofPattern("yyyyMMdd");
    private static final DateTimeFormatter GENIE_HOUR = DateTimeFormatter.ofPattern("HH");

    // Get Top200 Chart (실시간)
    public List<ChartVO> getGenieChartTop100(String artistName) throws Exception {
        return getGenieChart("D", true, artistName);
    }

    // Get Top200 Chart (타입 지정: ditc=D/W/M, rtm=Y/N)
    public List<ChartVO> getGenieChart(String ditc, boolean rtm, String artistName) throws Exception {
        ZonedDateTime now = ZonedDateTime.now(KST);
        String ymd = now.format(GENIE_DATE);
        String hh = now.format(GENIE_HOUR);
        String rtmStr = rtm ? "Y" : "N";

        List<ChartVO> data = new ArrayList<>();
        for (int page = 1; page <= 4; page++) {
            String url =
                    "https://www.genie.co.kr/chart/top200?ditc=" + ditc + "&rtm=" + rtmStr + "&ymd=" + ymd + "&hh=" + hh + "&pg=" + page;
            Document doc = fetchDocument(url);

            for (Element row : doc.select("table.list-wrap tbody tr.list")) {
                String songNumber = row.attr("songid");
                String rankText = row.selectFirst("td.number") != null ? row.selectFirst("td.number").text() : "";
                Integer rankValue = parseNumber(rankText);

                Element titleEl = row.selectFirst("td.info a.title");
                Element artistEl = row.selectFirst("td.info a.artist");
                Element albumEl = row.selectFirst("td.info a.albumtitle");
                Element artEl = row.selectFirst("td a.cover img");

                String title = titleEl != null ? titleEl.text() : "";
                String artist = artistEl != null ? artistEl.text() : "";
                String albumName = albumEl != null ? albumEl.text() : "";
                String albumArt = artEl != null ? artEl.attr("src") : "";
                if (albumArt.startsWith("//")) {
                    albumArt = "https:" + albumArt;
                }

                if (artistName != null && !artistName.isEmpty() && (artist == null || !artist.contains(artistName))) {
                    continue;
                }

                String[] rankStatus = resolveRankStatus(row);

                data.add(ChartVO.builder()
                        .rank(rankValue != null ? rankValue : data.size() + 1)
                        .artistName(artist)
                        .title(title)
                        .albumName(albumName)
                        .albumArt(albumArt)
                        .songNumber(songNumber)
                        .rankStatus(rankStatus[0])
                        .changedRank(Integer.parseInt(rankStatus[1]))
                        .build());
            }
        }

        return data;
    }

    private Document fetchDocument(String url) throws Exception {
        return Jsoup.connect(url)
                .userAgent("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36")
                .header("Accept", "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8")
                .header("Accept-Language", "ko-KR,ko;q=0.9,en-US;q=0.8,en;q=0.7")
                .header("Cache-Control", "no-cache")
                .header("Pragma", "no-cache")
                .referrer("https://www.genie.co.kr/")
                .get();
    }

    // Get tag value
    private List<String> getTextsOfElements(Document doc, String selector) {
        return doc.select(selector).stream()
                .map(Element::text)
                .collect(Collectors.toList());
    }

    private String[] resolveRankStatus(Element row) {
        Element statusEl = row.selectFirst("td.number span.rank span.rank-up, td.number span.rank span.rank-down, td.number span.rank span.rank-none, td.number span.rank span.rank-new, td.number span.rank span.rank-re");
        if (statusEl == null) {
            return new String[] {"static", "0"};
        }

        String className = statusEl.className();
        String text = statusEl.text();

        if (className.contains("rank-up")) {
            return new String[] {"up", String.valueOf(parseNumber(text))};
        }
        if (className.contains("rank-down")) {
            return new String[] {"down", String.valueOf(parseNumber(text))};
        }
        if (className.contains("rank-new") || className.contains("rank-re")) {
            return new String[] {"new", "0"};
        }
        return new String[] {"static", "0"};
    }

    private Integer parseNumber(String text) {
        if (text == null) return null;
        Matcher m = Pattern.compile("(\\d+)").matcher(text);
        if (m.find()) {
            return Integer.parseInt(m.group(1));
        }
        return null;
    }

    // Get tag attribute values
    private List<String> getAttrsOfElements(Document doc, String selector, String attr) {
        return doc.select(selector).stream()
                .map(element -> element.attr(attr))
                .collect(Collectors.toList());
    }

    // Find AlbumNames By ArtistName
    public List<DetailVO> getAlbums(String artistName) throws Exception {
        String url = "https://www.genie.co.kr/search/searchAlbum?query=" +
                artistName;
        Document doc = Jsoup.connect(url).userAgent("Chrome").get();
        List<DetailVO> data = new ArrayList<>();
        for (Element element : doc.select("dt > a")) {
            Matcher m = Pattern.compile("fnViewAlbumLayer\\('(.*?)'\\)").matcher(element.attr("onclick"));
            while (m.find()) {
                data.add(DetailVO.builder()
                        .title(element.text())
                        .number(m.group(1))
                        .build());
            }
        }
        return data;
    }

    // Find Songs By AlbumNumber
    public List<DetailVO> getSongLists(String albumNumber) throws Exception {
        String url = "https://www.genie.co.kr/detail/albumInfo?axnm=" + albumNumber;
        Document doc = Jsoup.connect(url).userAgent("Chrome").get();
        List<DetailVO> data = new ArrayList<>();
        for (Element element : doc.select("tbody > .list")) {
            data.add(DetailVO.builder()
                    .title(element.select(".title").text())
                    .number(element.attr("songid"))
                    .build());
        }
        return data;
    }
}
