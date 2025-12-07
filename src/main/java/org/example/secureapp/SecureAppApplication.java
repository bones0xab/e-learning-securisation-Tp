package org.example.secureapp;

import org.example.secureapp.entitie.Courses;
import org.example.secureapp.repo.CourseRepository;
import org.example.secureapp.service.CourseInterface;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;

@SpringBootApplication
public class SecureAppApplication {

    public static void main(String[] args) {
        SpringApplication.run(SecureAppApplication.class, args);
    }

    @Autowired
    private  CourseRepository courseRepository;

    @Bean
    CommandLineRunner run(){
        return args -> {
            Courses courses = new Courses().builder()
                    .courseName("Java")
                    .courseDescription("Java is a programming language")
                    .build();

            Courses courses1 = new Courses().builder()
                    .courseName("Python")
                    .courseDescription("Python is a programming language")
                    .build();

            courseRepository.save(courses);
            courseRepository.save(courses1);
        };
    }
}
