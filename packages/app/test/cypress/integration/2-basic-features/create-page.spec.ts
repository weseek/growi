context('Create page', () => {

  const ssPrefix = 'create-page';

  let connectSid: string | undefined;

  before(() => {
    // login
    cy.fixture("user-admin.json").then(user => {
      cy.login(user.username, user.password);
    });
    cy.getCookie('connect.sid').then(cookie => {
      connectSid = cookie?.value;
    });
  });

  beforeEach(() => {
    if (connectSid != null) {
      cy.setCookie('connect.sid', connectSid);
      cy.visit('/');
    }
  });

  // it("/Page Hello under today's page is successfully created", () => {
  //   cy.getByTestid('newPageBtn').click();
  //   cy.screenshot(`${ssPrefix}-opne-modal`)
  //   cy.getByTestid('createTodaysPageInput').type("Hello");
  //   cy.screenshot('input Hello');
  //   cy.getByTestid('createTodaysPageBtn').click();

  // });

  it("/Page Hola under / is successfully created", ()=>{
    cy.getByTestid('newPageBtn').click();
    cy.screenshot(`${ssPrefix}-opne-modal`)
    cy.getByTestid('createPageInput').type('Hola');
    cy.screenshot('input Hola');
    cy.getByTestid('createPageBtn');

  })

});
