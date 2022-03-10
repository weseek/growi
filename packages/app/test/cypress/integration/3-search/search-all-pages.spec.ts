context('Search all pages', () => {
  const ssPrefix = 'search-all-pages';

  let connectSid: string | undefined;

  before(() =>{
    // login
    cy.fixture("user-admin.json").then(user => {
      cy.login(user.username, user.password);
    });
    cy.getCookie('connect.sid').then(cookie => {
      connectSid = cookie?.value;
    });
  });

  beforeEach(() =>{
    if(connectSid != null){
      cy.setCookie('connect.sid', connectSid);
    }
  });

  it('Searching all pages', () => {
    cy.visit('/');
    cy.getByTestid('global-search-input').click();
  })
});
