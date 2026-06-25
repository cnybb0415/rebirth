package com.maxjang.chart;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class MusicChartApplication {
    public static void main(String[] args) {
        SpringApplication.run(MusicChartApplication.class, args);
    }
}
