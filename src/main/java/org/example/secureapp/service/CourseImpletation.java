package org.example.secureapp.service;

import lombok.AllArgsConstructor;
import org.example.secureapp.entitie.Courses;
import org.example.secureapp.repo.CourseRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@AllArgsConstructor
public class CourseImpletation implements CourseInterface{

    private final CourseRepository courseRepository;

    @Override
    public List<Courses> getCourses() {
        return this.courseRepository.findAll();
    }

    @Override
    public void saveCourses(Courses courses) {
        this.courseRepository.save(courses);
    }
}
