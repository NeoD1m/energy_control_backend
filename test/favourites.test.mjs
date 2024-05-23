// import { expect } from 'chai';
// import sinon from 'sinon';
// import pool from 'server.js';
// import { addFavouritePDF } from 'server.js';

// describe('addFavouritePDF', () => {
//   let queryStub;

//   beforeEach(() => {
//     queryStub = sinon.stub(pool, 'query');
//   });

//   afterEach(() => {
//     queryStub.restore();
//   });

//   it('should add a favourite PDF and return the result', async () => {
//     const userId = 1;
//     const pdfId = 2;
//     const mockResult = { rows: [{ user_id: userId, file_id: pdfId }] };

//     queryStub.resolves(mockResult);

//     const result = await addFavouritePDF(userId, pdfId);

//     expect(result).to.deep.equal(mockResult.rows[0]);
//     expect(queryStub.calledOnce).to.be.true;
//     expect(queryStub.firstCall.args).to.deep.equal([
//       'INSERT INTO user_favourites (user_id, file_id) VALUES ($1, $2) RETURNING *;',
//       [userId, pdfId]
//     ]);
//   });

//   it('should throw an error if the query fails', async () => {
//     const userId = 1;
//     const pdfId = 2;
//     const mockError = new Error('Query failed');

//     queryStub.rejects(mockError);

//     try {
//       await addFavouritePDF(userId, pdfId);
//       throw new Error('Expected function to throw');
//     } catch (error) {
//       expect(error).to.equal(mockError);
//       expect(queryStub.calledOnce).to.be.true;
//       expect(queryStub.firstCall.args).to.deep.equal([
//         'INSERT INTO user_favourites (user_id, file_id) VALUES ($1, $2) RETURNING *;',
//         [userId, pdfId]
//       ]);
//     }
//   });
// });