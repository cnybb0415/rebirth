package com.maxjang.chart.melon;

import com.maxjang.chart.common.DetailVO;
import com.maxjang.chart.common.ChartVO;
import org.jsoup.Jsoup;
import org.jsoup.nodes.Document;
import org.jsoup.nodes.Element;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

@Service
public class MelonChartService {
    private Document fetchDocument(String url) throws Exception {
        // Melon may return different markup depending on headers; provide a stable UA + basic headers.
        return Jsoup.connect(url)
                .userAgent("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36")
                .header("Accept", "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8")
                .header("Accept-Language", "ko-KR,ko;q=0.9,en-US;q=0.8,en;q=0.7")
                .referrer("https://www.melon.com/")
                .get();
    }

    private List<ChartVO> parseChartRows(Document doc, String artistName) {
        List<ChartVO> data = new ArrayList<>();

        int chartRank = 0;
        for (Element row : doc.select("tr[data-song-no]")) {
            chartRank += 1;
            String songNumber = row.attr("data-song-no");

            Element titleEl = row.selectFirst(".rank01 a");
            Element albumEl = row.selectFirst(".rank03 a");
            Element artEl = row.selectFirst("a.image_typeAll img");
            List<String> artistParts = row.select(".rank02 a").eachText();

            if (titleEl == null) continue;
            String title = titleEl.text();

            String artistText;
            if (artistParts != null && !artistParts.isEmpty()) {
                artistText = String.join(", ", artistParts);
            } else {
                // Fallback selector for some markup variants
                Element artistSpan = row.selectFirst(".rank02 span");
                artistText = artistSpan != null ? artistSpan.text() : "";
            }

            if (artistName != null && !artistName.isEmpty() && (artistText == null || !artistText.contains(artistName))) {
                continue;
            }

            String albumName = albumEl != null ? albumEl.text() : "";
            String albumArt = artEl != null ? artEl.attr("src") : "";
            String[] rankStatus = resolveRankStatus(row);

            data.add(ChartVO.builder()
                    .rank(chartRank)
                    .artistName(artistText)
                    .title(title)
                    .albumName(albumName)
                    .albumArt(albumArt)
                    .songNumber(songNumber)
                    .rankStatus(rankStatus[0])
                    .changedRank(Integer.parseInt(rankStatus[1]))
                    .build());
        }

        return data;
    }

    private String[] resolveRankStatus(Element row) {
        Element rankWrap = row.selectFirst(".rank_wrap");
        if (rankWrap == null) {
            return new String[] {"static", "0"};
        }
        Element icon = rankWrap.selectFirst(".bullet_icons");
        String iconClass = icon != null ? icon.className() : "";

        Element upValue = rankWrap.selectFirst("span.up");
        Element downValue = rankWrap.selectFirst("span.down");
        Element noneValue = rankWrap.selectFirst("span.none");

        if (iconClass.contains("rank_up")) {
            return new String[] {"up", String.valueOf(parseDelta(upValue != null ? upValue.text() : ""))};
        }
        if (iconClass.contains("rank_down")) {
            return new String[] {"down", String.valueOf(parseDelta(downValue != null ? downValue.text() : ""))};
        }
        if (iconClass.contains("rank_new") || iconClass.contains("rank_re")) {
            return new String[] {"new", "0"};
        }
        if (iconClass.contains("rank_static")) {
            return new String[] {"static", "0"};
        }

        String text = rankWrap.text();
        if (text.contains("상승")) {
            return new String[] {"up", String.valueOf(parseDelta(text))};
        }
        if (text.contains("하락")) {
            return new String[] {"down", String.valueOf(parseDelta(text))};
        }
        if (text.contains("순위 동일")) {
            return new String[] {"static", "0"};
        }
        if (noneValue != null) {
            return new String[] {"static", "0"};
        }

        return new String[] {"static", "0"};
    }

    private int parseDelta(String text) {
        Matcher m = Pattern.compile("(\\d+)").matcher(text);
        if (m.find()) {
            return Integer.parseInt(m.group(1));
        }
        return 0;
    }

    // Get TOP100 Chart
    public List<ChartVO> getMelonChartTop100(String artistName) throws Exception {
        String url = "https://www.melon.com/chart/index.htm";
        Document doc = fetchDocument(url);
        return parseChartRows(doc, artistName);
    }

    // Get Daily Chart
    public List<ChartVO> getMelonChartDaily(String artistName) throws Exception {
        String url = "https://www.melon.com/chart/day/index.htm?classCd=GN0000";
        Document doc = fetchDocument(url);
        return parseChartRows(doc, artistName);
    }

    // Get Weekly Chart
    public List<ChartVO> getMelonChartWeekly(String artistName) throws Exception {
        String url = "https://www.melon.com/chart/week/index.htm?classCd=GN0000";
        Document doc = fetchDocument(url);
        return parseChartRows(doc, artistName);
    }

    // Get Monthly Chart
    public List<ChartVO> getMelonChartMonthly(String artistName) throws Exception {
        String url = "https://www.melon.com/chart/month/index.htm?classCd=GN0000";
        Document doc = fetchDocument(url);
        return parseChartRows(doc, artistName);
    }

    // Get HOT100 Chart (D100 = 발매100일, D30 = 발매30일)
    public List<ChartVO> getMelonHot100(String chartType, String artistName) throws Exception {
        String safeType = "D100";
        if (chartType != null && chartType.equalsIgnoreCase("D30")) {
            safeType = "D30";
        }

        String url = "https://www.melon.com/chart/hot100/index.htm?chartType=" + safeType;
        Document doc = fetchDocument(url);
        return parseChartRows(doc, artistName);
    }

    // Get tag value
    private List<String> getTextsOfElements(Document doc, String selector) {
        return doc.select(selector).stream()
                .map(Element::text)
                .collect(Collectors.toList());
    }

    // Get tag attribute values
    private List<String> getAttrsOfElements(Document doc, String selector, String attr) {
        return doc.select(selector).stream()
                .map(element -> element.attr(attr))
                .collect(Collectors.toList());
    }

    // Find AlbumNames By ArtistName
    public List<DetailVO> getAlbums(String artistName) throws Exception {
        String url = "https://www.melon.com/search/album/index.htm?q=" +
                artistName +
                "&section=&searchGnbYn=Y&kkoSpl=Y&kkoDpType=&linkOrText=T&ipath=srch_form";
        Document doc = Jsoup.connect(url).userAgent("Chrome").get();
        List<DetailVO> data = new ArrayList<>();
        for (Element element : doc.select("dt > a")) {
            Matcher m = Pattern.compile("goAlbumDetail\\('(.*?)'\\)").matcher(element.attr("href"));
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
        String url = "https://www.melon.com/album/detail.htm?albumId=" + albumNumber;
        Document doc = Jsoup.connect(url).userAgent("Chrome").get();
        List<DetailVO> data = new ArrayList<>();
        for (Element element : doc.select(".wrap_song_info .ellipsis > span > a")) {
            Matcher m = Pattern.compile(",(.*?)\\)").matcher(element.attr("href"));
            while (m.find()) {
                data.add(DetailVO.builder()
                        .title(element.text())
                        .number(m.group(1))
                        .build());
            }
        }
        return data;
    }
}
