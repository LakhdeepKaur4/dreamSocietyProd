const request = require('supertest');
const {get}  = require('../assetType')

test('list all countries',  (done) => {
    request(get).get('/api/assetsType')
    .expect(200)
    .then(res => {
        expect(res.body).toBe(Array);
        // console.log(res.body);
    })
    done();
   });