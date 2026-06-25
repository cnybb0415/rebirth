package com.maxjang.chart.bugs;

import com.maxjang.chart.common.ChartVO;
import com.maxjang.chart.common.DetailVO;
import com.maxjang.chart.common.ResponseFormat;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/bugs")
public class BugsChartController {

    private final BugsChartService bugsChartService;

    @Autowired
    public BugsChartController(BugsChartService bugsChartService) {
        this.bugsChartService = bugsChartService;
    }

    @GetMapping("/chart")
    public ResponseFormat<ChartVO> getBugsChartTop100() throws Exception {
        return new ResponseFormat<>(bugsChartService.getBugsChartTop100(false, null));
    }

    @GetMapping("/chart/{artistName}")
    public List<ChartVO> getBugsChartTop100ByArtistName(@PathVariable String artistName) throws Exception {
        return bugsChartService.getBugsChartTop100(true, artistName);
    }

    // 일간
    @GetMapping("/chart/day")
    public ResponseFormat<ChartVO> getBugsChartDay() throws Exception {
        return new ResponseFormat<>(bugsChartService.getBugsChart("https://music.bugs.co.kr/chart/track/day/total", false, null));
    }

    @GetMapping("/chart/day/{artistName}")
    public List<ChartVO> getBugsChartDayByArtist(@PathVariable String artistName) throws Exception {
        return bugsChartService.getBugsChart("https://music.bugs.co.kr/chart/track/day/total", true, artistName);
    }

    // 주간
    @GetMapping("/chart/week")
    public ResponseFormat<ChartVO> getBugsChartWeek() throws Exception {
        return new ResponseFormat<>(bugsChartService.getBugsChart("https://music.bugs.co.kr/chart/track/week/total", false, null));
    }

    @GetMapping("/chart/week/{artistName}")
    public List<ChartVO> getBugsChartWeekByArtist(@PathVariable String artistName) throws Exception {
        return bugsChartService.getBugsChart("https://music.bugs.co.kr/chart/track/week/total", true, artistName);
    }

    @GetMapping("/album/{artistName}")
    public ResponseFormat<DetailVO> getAlbums(@PathVariable String artistName) throws Exception {
        return new ResponseFormat<>(bugsChartService.getAlbums(artistName));
    }

    @GetMapping("/song/{albumNumber}")
    public ResponseFormat<DetailVO> getSongs(@PathVariable String albumNumber) throws Exception {
        return new ResponseFormat<>(bugsChartService.getSongLists(albumNumber));
    }



}
