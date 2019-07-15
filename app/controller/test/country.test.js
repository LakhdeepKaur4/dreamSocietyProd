const request = require('supertest');
const {get,create}  = require('../country');
var express = require('express');
var app = express();
var bodyParser = require('body-parser');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

test('list all countries',  (done) => {
    request(get).get('/api/country')
    .expect(200)
    .then(res => {
        expect(res.body).toBe(Array);
        // console.log(res.body);
    })
    done();
   });

   let data  = {
    "countryName": "Test",
    "code": 'SRI',
    "currency": 'rupee',
    "phoneCode": '33',
}

test('respond with 201 created', function (done) {

    request(create)
        .post('/api/country',{"countryName": "Test"})
        .send({
            "countryName": "Test", 
            "code": 'SRI',
            "currency": 'rupee',
            "phoneCode": '33', 
        })
        // .field('countryName', 'Test')
        // .type('form')
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .expect(201)
        .end((err) => {
            if (err) return done(err);
            done();
        });
});  
   