package com.maxjang.chart.flo;

import com.maxjang.chart.common.ChartVO;
import com.maxjang.chart.common.ResponseFormat;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/flo")
public class FloChartController {

    private final FloChartService floChartService;

    @Autowired
    public FloChartController(FloChartService floChartService) {
        this.floChartService = floChartService;
    }

    @GetMapping("/chart")
    public ResponseFormat<ChartVO> getFloChartTop100() throws Exception {
        return new ResponseFormat<>(floChartService.getFloChartTop100(null));
    }

    @GetMapping("/chart/{artistName}")
    public ResponseFormat<ChartVO> getFloChartTop100ByArtistName(@PathVariable String artistName) throws Exception {
        return new ResponseFormat<>(floChartService.getFloChartTop100(artistName));
    }
}
