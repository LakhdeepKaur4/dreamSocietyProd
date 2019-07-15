const request = require('supertest');
const {get}  = require('../designation')

test('list all designations',  (done) => {
    request(get).get('/api/designation')
    .expect(200)
    .then(res => {
        expect(res.body).toBe(Array);
        // console.log(res.body);
    })
    done();
   });