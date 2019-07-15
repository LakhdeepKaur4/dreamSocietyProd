const request = require('supertest');
const {get}  = require('../assets')

test('list all countries',  (done) => {
    request(get).get('/api/assets')
    .expect(200)
    .then(res => {
        expect(res.body).toBe(Array);
        // console.log(res.body);
    })
    done();
   });