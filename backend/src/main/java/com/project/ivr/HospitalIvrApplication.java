package com.project.ivr;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.transaction.annotation.EnableTransactionManagement;

@SpringBootApplication
@EnableTransactionManagement
public class HospitalIvrApplication {

    public static void main(String[] args) {
        SpringApplication.run(HospitalIvrApplication.class, args);
    }
}
