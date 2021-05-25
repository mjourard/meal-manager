package com.mealmanager.api.controller;

import com.mealmanager.api.model.SysUser;
import com.mealmanager.api.repository.SysUserRepository;
import com.mealmanager.api.services.EmailService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Profile;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import javax.mail.MessagingException;
import java.io.UnsupportedEncodingException;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Profile("api")
@CrossOrigin(origins = "http://localhost:3000")
@RestController
@RequestMapping("/api")
public class SysUserController {

    private final Logger logger = LoggerFactory.getLogger(SysUserController.class);

    @Autowired
    SysUserRepository sysUserRepository;

    @Autowired
    EmailService emailService;

    @GetMapping("/users")
    public ResponseEntity<List<SysUser>> getAllSysUsers(@RequestParam(required = false) String name) {
        try {
            List<SysUser> sysUsers = new ArrayList<SysUser>(sysUserRepository.findAll());
            if (sysUsers.isEmpty()) {
                return new ResponseEntity<>(HttpStatus.NO_CONTENT);
            }

            return new ResponseEntity<>(sysUsers, HttpStatus.OK);
        } catch (Exception e) {
            return new ResponseEntity<>(null, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @GetMapping("/users/{id}")
    public ResponseEntity<SysUser> getSysUserById(@PathVariable("id") long id) {
        Optional<SysUser> sysUserData = sysUserRepository.findById(id);

        if (sysUserData.isPresent()) {
            return new ResponseEntity<>(sysUserData.get(), HttpStatus.OK);
        } else {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }

    @PostMapping("/users")
    public ResponseEntity<SysUser> createSysUser(@RequestBody SysUser sysUser) {
        try {
            SysUser _sysUser = sysUserRepository
                    .save(new SysUser(sysUser.getFirstName(), sysUser.getLastName(), sysUser.getEmail(), sysUser.getDefaultChecked()));
            return new ResponseEntity<>(_sysUser, HttpStatus.CREATED);
        } catch (Exception e) {
            return new ResponseEntity<>(null, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @PostMapping("/users/multiadd")
    public ResponseEntity<List<SysUser>> createSysUsers(@RequestBody List<SysUser> sysUsers) {
        try {
            List<SysUser> _sysUsers = sysUserRepository.saveAll(sysUsers);
            return new ResponseEntity<>(_sysUsers, HttpStatus.CREATED);
        } catch (Exception e) {
            logger.error("error while trying to add multiple sysUsers", e);
            return new ResponseEntity<>(null, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @PutMapping("/users/{id}")
    public ResponseEntity<SysUser> updateSysUser(@PathVariable("id") long id, @RequestBody SysUser sysUser) {
        Optional<SysUser> sysUserData = sysUserRepository.findById(id);

        if (sysUserData.isPresent()) {
            SysUser _sysUser = sysUserData.get();
            _sysUser.setFirstName(sysUser.getFirstName());
            _sysUser.setLastName(sysUser.getLastName());
            _sysUser.setEmail(sysUser.getEmail());
            return new ResponseEntity<>(sysUserRepository.save(_sysUser), HttpStatus.OK);
        } else {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }

    @DeleteMapping("/users/{id}")
    public ResponseEntity<HttpStatus> deleteSysUser(@PathVariable("id") long id) {
        try {
            sysUserRepository.deleteById(id);
            return new ResponseEntity<>(HttpStatus.NO_CONTENT);
        } catch (Exception e) {
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @DeleteMapping("/users")
    public ResponseEntity<HttpStatus> deleteAllSysUsers() {
        try {
            sysUserRepository.deleteAll();
            return new ResponseEntity<>(HttpStatus.NO_CONTENT);
        } catch (Exception e) {
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @GetMapping("/emailuser")
    public ResponseEntity<HttpStatus> testSendEmail() {
        String recipient = "mjourard@gmail.com";
        String subject = "Amazon SES SMTP Interface Test";
        String content = "<p>Hi there, this is a test email.</p>";

        try {
            emailService.sendEmail(recipient, subject, content);
            return new ResponseEntity<>(HttpStatus.OK);
        } catch (UnsupportedEncodingException | MessagingException e) {
            logger.error("Exception thrown sending email", e);
            return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
        }
    }
}