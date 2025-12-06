package org.example.secureapp.service;

import org.example.secureapp.entitie.Courses;

import java.security.PublicKey;
import java.util.List;

public interface CourseInterface {

    List<Courses> getCourses();
    void saveCourses(Courses courses);
}
