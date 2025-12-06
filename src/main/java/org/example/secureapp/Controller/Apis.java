package org.example.secureapp.Controller;

import lombok.AllArgsConstructor;
import lombok.Getter;
import org.example.secureapp.entitie.Courses;
import org.example.secureapp.service.CourseInterface;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Controller;
import org.springframework.stereotype.Repository;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/courses")
@AllArgsConstructor
public class Apis {


    private final CourseInterface courseInterface;

    @GetMapping
    @PreAuthorize("hasAnyAuthority('ROLE_STUDENT', 'ROLE_ADMIN')")
    public List<Courses> getCourses(){
        return this.courseInterface.getCourses();
    }

    @PostMapping
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public void saveCourses(@RequestBody Courses courses){
        this.courseInterface.saveCourses(courses);
    }

}
