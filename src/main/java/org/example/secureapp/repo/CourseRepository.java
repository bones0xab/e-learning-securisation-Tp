package org.example.secureapp.repo;

import org.example.secureapp.entitie.Courses;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface CourseRepository extends JpaRepository<Courses, Long> {
}
