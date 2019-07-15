const request = require('supertest');
const db = require('../../config/db.config');
const {get,create}  = require('../city');
const City = db.city;

// test('Create a city', async(done) => {
//     const city = {
//         cityName: "Chennai",
//         stateId:2,
//         countryId:1
//     };

//     await City.count().then(async function (count) {

//         await request(create)
//             .post('/api/city')
//             .send(city)
//             .then(async() => {
//                 await City.count().then(function (newcount) {
//                     expect(newcount).toBe(count + 1);
//                     // execute done callback here
//                     done();
//                 });
//             })
//             .catch(err => {
//                 // write test for failure here
//                 console.log(`Error ${err}`)
//                 done()
//             });
//     });
// });

test('list all city',   (done) => {
   request(get).get('/api/city')
    .expect(200)
    .then(res => {
        expect(res.body).toBe(Array);
    })
    done();
   });

   