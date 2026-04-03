package com.maxjang.chart.genie;

import com.maxjang.chart.common.DetailVO;
import com.maxjang.chart.common.ChartVO;
import com.maxjang.chart.common.ResponseFormat;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/genie")
public class GenieChartController {

    private final GenieChartService genieChartService;

    @Autowired
    public GenieChartController(GenieChartService genieChartService) {
        this.genieChartService = genieChartService;
    }

    @GetMapping("/chart")
    public ResponseFormat<ChartVO> getGenieChartTop100() throws Exception {
        return new ResponseFormat<>(genieChartService.getGenieChartTop100(null));
    }
    @GetMapping("/chart/{artistName}")
    public ResponseFormat<ChartVO> getGenieChartTop100ByArtistName(@PathVariable String artistName) throws Exception {
        return new ResponseFormat<>(genieChartService.getGenieChartTop100(artistName));
    }

    // 일간 (ditc=D, rtm=N)
    @GetMapping("/chart/daily")
    public ResponseFormat<ChartVO> getGenieChartDaily() throws Exception {
        return new ResponseFormat<>(genieChartService.getGenieChart("D", false, null));
    }
    @GetMapping("/chart/daily/{artistName}")
    public ResponseFormat<ChartVO> getGenieChartDailyByArtist(@PathVariable String artistName) throws Exception {
        return new ResponseFormat<>(genieChartService.getGenieChart("D", false, artistName));
    }

    // 주간 (ditc=W, rtm=N)
    @GetMapping("/chart/weekly")
    public ResponseFormat<ChartVO> getGenieChartWeekly() throws Exception {
        return new ResponseFormat<>(genieChartService.getGenieChart("W", false, null));
    }
    @GetMapping("/chart/weekly/{artistName}")
    public ResponseFormat<ChartVO> getGenieChartWeeklyByArtist(@PathVariable String artistName) throws Exception {
        return new ResponseFormat<>(genieChartService.getGenieChart("W", false, artistName));
    }

    // 월간 (ditc=M, rtm=N)
    @GetMapping("/chart/monthly")
    public ResponseFormat<ChartVO> getGenieChartMonthly() throws Exception {
        return new ResponseFormat<>(genieChartService.getGenieChart("M", false, null));
    }
    @GetMapping("/chart/monthly/{artistName}")
    public ResponseFormat<ChartVO> getGenieChartMonthlyByArtist(@PathVariable String artistName) throws Exception {
        return new ResponseFormat<>(genieChartService.getGenieChart("M", false, artistName));
    }

    @GetMapping("/albums/{artistName}")
    public ResponseFormat<DetailVO> getAlbums(@PathVariable String artistName) throws Exception {
        return new ResponseFormat<>(genieChartService.getAlbums(artistName));
    }

    @GetMapping("/songs/{albumNumber}")
    public ResponseFormat<DetailVO> getSongs(@PathVariable String albumNumber) throws Exception {
        return new ResponseFormat<>(genieChartService.getSongLists(albumNumber));
    }




}
