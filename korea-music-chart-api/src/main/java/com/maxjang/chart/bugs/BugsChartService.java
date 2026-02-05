package com.maxjang.chart.bugs;

import com.maxjang.chart.common.ChartVO;
import com.maxjang.chart.common.DetailVO;
import org.jsoup.Jsoup;
import org.jsoup.nodes.Document;
import org.jsoup.nodes.Element;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class BugsChartService {
    // Get Top100 Chart
    public List<ChartVO> getBugsChartTop100(boolean isSearch, String artistName) throws Exception {
        String url1 = "https://music.bugs.co.kr/chart";
        Document doc1 = fetchDocument(url1);

        List<String> artistNames = getTextsOfElements(doc1, "p.artist");

        List<String> titles = getTextsOfElements(doc1, "p.title");

        List<String> albumNames = getTextsOfElements(doc1, ".left .album");

        List<String> albumArts = getAttrsOfElements(doc1, ".thumbnail img", "src");

        List<String> songNumbers = getAttrsOfElements(doc1, ".trackList tbody > tr", "trackid");

        List<String> rankStatuses = getRankStatus(doc1);

        int limit = minSize(titles, artistNames, albumNames, albumArts, songNumbers);
        List<ChartVO> data = new ArrayList<>();
        for (int i = 0; i < limit; i++) {
            String rankStatus = i < rankStatuses.size() ? rankStatuses.get(i) : "static,0";
            String[] rank = rankStatus.split(",");
            String albumArt = normalizeAlbumArt(albumArts.get(i));
            if (isSearch) { // 아티스트 필터링 검색일 때
                if (artistNames.get(i).contains(artistName)) { // 해당 아티스트만 리스트에 추가
                    data.add(ChartVO.builder()
                            .rank(i + 1)
                            .artistName(artistNames.get(i))
                            .title(titles.get(i))
                            .albumName(albumNames.get(i))
                            .albumArt(albumArt)
                            .songNumber(songNumbers.get(i))
                            .rankStatus(rank[0])
                            .changedRank(Integer.parseInt(rank[1]))
                            .build());
                }
            } else { // TOP 100 차트
                data.add(ChartVO.builder()
                        .rank(i + 1)
                        .artistName(artistNames.get(i))
                        .title(titles.get(i))
                        .albumName(albumNames.get(i))
                        .albumArt(albumArt)
                        .songNumber(songNumbers.get(i))
                        .rankStatus(rank[0])
                        .changedRank(Integer.parseInt(rank[1]))
                        .build());
            }
        }
        return data;
    }

    // Get tag value
    private List<String> getTextsOfElements(Document doc, String selector) {
        return doc.select(selector).stream()
                .map(Element::text)
                .collect(Collectors.toList());
    }

    // Get RankStatus
    private List<String> getRankStatus(Document doc) {
        List<String> hasChangedList = new ArrayList<>();
        for (Element element : doc.select(".byChart tbody .ranking p")) {
            String[] classNames = element.className().split(" ");
            if (classNames.length < 2) {
                hasChangedList.add("static,0");
                continue;
            }
            String className = classNames[1];
            String text = element.select("em").text();
            switch (className) {
                case "none":
                    hasChangedList.add("static,0");
                    break;
                case "up":
                    hasChangedList.add("up," + text);
                    break;
                case "down":
                    hasChangedList.add("down," + text);
                    break;
                case "new":
                case "renew":
                    hasChangedList.add("new,0"); // 진입
                    break;
                default:
                    hasChangedList.add("static,0");
                    break;
            }
        }
        return hasChangedList;
    }

    private Document fetchDocument(String url) throws Exception {
        return Jsoup.connect(url)
                .userAgent("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36")
                .referrer("https://music.bugs.co.kr/")
                .timeout(10_000)
                .get();
    }

    private int minSize(List<?>... lists) {
        int min = Integer.MAX_VALUE;
        for (List<?> list : lists) {
            if (list == null) return 0;
            min = Math.min(min, list.size());
        }
        return min == Integer.MAX_VALUE ? 0 : min;
    }

    private String normalizeAlbumArt(String src) {
        if (src == null || src.isBlank()) return "";
        if (src.startsWith("http://") || src.startsWith("https://")) return src;
        if (src.startsWith("//")) return "https:" + src;
        return "https://music.bugs.co.kr" + src;
    }

    // Get tag attribute values
    private List<String> getAttrsOfElements(Document doc, String selector, String attr) {
        return doc.select(selector).stream()
                .map(element -> element.attr(attr))
                .collect(Collectors.toList());
    }

    // Find AlbumNames By ArtistName
    public List<DetailVO> getAlbums(String artistName) throws Exception {
        String url = "https://music.bugs.co.kr/search/album?q="
                + artistName
                + "&target=ARTIST_ONLY&flac_only=false&sort=A";
        Document doc = fetchDocument(url);
        List<DetailVO> data = new ArrayList<>();
        for (Element element : doc.select(".albumInfo")) {
                data.add(DetailVO.builder()
                        .title(element.select(".albumTitle").text())
                        .number(element.attr("albumid"))
                        .build());
        }
        return data;
    }

    // Find Songs By AlbumNumber
    public List<DetailVO> getSongLists(String albumNumber) throws Exception {
        String url = "https://music.bugs.co.kr/album/" + albumNumber;
        Document doc = fetchDocument(url);
        List<DetailVO> data = new ArrayList<>();
        for (Element element : doc.select(".track tbody tr")) {
            data.add(DetailVO.builder()
                    .title(element.select(".title").text())
                    .number(element.attr("trackid"))
                    .build());
        }
        return data;
    }
}
