const expect = require('chai').expect;
const jwt = require('jsonwebtoken');
const sinon = require('sinon');

const authMiddleware = require('../middleware/is-auth');

describe('Auth middleware', () => {
  it('Should throw an error if no authorization header is present', () => {
    const req = {
      get: (headerName) => {
        return null;
      }
    };
  
    expect(authMiddleware.bind(this, req, {}, () => {})).to.throw('Not authenticated');
  })
  
  it('should throw error if the authorization header is only one string', () => {
    const req = {
      get: (headerName) => {
        return "asdasd";
      }
    };
  
    expect(authMiddleware.bind(this, req, {}, () => {})).to.throw();
  })

  it('should yield a user after decoding the token', () => {
    const req = {
      get: (headerName) => {
        return "Bearer asdasdasadasdasdasdasgfsg";
      }
    };

    sinon.stub(jwt, 'verify');
    jwt.verify.returns({userId: 'abc'});

    authMiddleware(req, {}, () => {});
    expect(req).to.have.property('userId', 'abc');

    jwt.verify.restore();
  })
})

