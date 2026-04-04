package com.maxjang.chart.melon;

import com.maxjang.chart.common.DetailVO;
import com.maxjang.chart.common.ChartVO;
import com.maxjang.chart.common.ResponseFormat;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/melon")
public class MelonChartController {
    private final MelonChartService melonChartService;

    @Autowired
    public MelonChartController(MelonChartService melonChartService) {
        this.melonChartService = melonChartService;
    }

    @GetMapping("/chart")
    public ResponseFormat<ChartVO> getMelonChartTop100() throws Exception {
        return new ResponseFormat<>(melonChartService.getMelonChartTop100(null));
    }

    @GetMapping("/chart/{artistName}")
    public ResponseFormat<ChartVO> getMelonChartTop100ByArtistName(@PathVariable String artistName) throws Exception {
        return new ResponseFormat<>(melonChartService.getMelonChartTop100(artistName));
    }

    @GetMapping("/chart/daily")
    public ResponseFormat<ChartVO> getMelonChartDaily() throws Exception {
        return new ResponseFormat<>(melonChartService.getMelonChartDaily(null));
    }
    @GetMapping("/chart/daily/{artistName}")
    public ResponseFormat<ChartVO> getMelonChartDailyByArtist(@PathVariable String artistName) throws Exception {
        return new ResponseFormat<>(melonChartService.getMelonChartDaily(artistName));
    }

    @GetMapping("/chart/weekly")
    public ResponseFormat<ChartVO> getMelonChartWeekly() throws Exception {
        return new ResponseFormat<>(melonChartService.getMelonChartWeekly(null));
    }
    @GetMapping("/chart/weekly/{artistName}")
    public ResponseFormat<ChartVO> getMelonChartWeeklyByArtist(@PathVariable String artistName) throws Exception {
        return new ResponseFormat<>(melonChartService.getMelonChartWeekly(artistName));
    }

    @GetMapping("/chart/monthly")
    public ResponseFormat<ChartVO> getMelonChartMonthly() throws Exception {
        return new ResponseFormat<>(melonChartService.getMelonChartMonthly(null));
    }
    @GetMapping("/chart/monthly/{artistName}")
    public ResponseFormat<ChartVO> getMelonChartMonthlyByArtist(@PathVariable String artistName) throws Exception {
        return new ResponseFormat<>(melonChartService.getMelonChartMonthly(artistName));
    }

    @GetMapping("/hot100/{chartType}/chart")
    public ResponseFormat<ChartVO> getMelonHot100(@PathVariable String chartType) throws Exception {
        return new ResponseFormat<>(melonChartService.getMelonHot100(chartType, null));
    }

    @GetMapping("/hot100/{chartType}/chart/{artistName}")
    public ResponseFormat<ChartVO> getMelonHot100ByArtistName(
            @PathVariable String chartType,
            @PathVariable String artistName
    ) throws Exception {
        return new ResponseFormat<>(melonChartService.getMelonHot100(chartType, artistName));
    }

    @GetMapping("/albums/{artistName}")
    public ResponseFormat<DetailVO> getAlbums(@PathVariable String artistName) throws Exception {
        return new ResponseFormat<>(melonChartService.getAlbums(artistName));
    }

    @GetMapping("/songs/{albumNumber}")
    public ResponseFormat<DetailVO> getSongs(@PathVariable String albumNumber) throws Exception {
        return new ResponseFormat<>(melonChartService.getSongLists(albumNumber));
    }

}
