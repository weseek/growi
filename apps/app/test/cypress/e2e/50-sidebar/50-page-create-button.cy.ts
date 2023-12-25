describe('Access to PageCreateButton', () => {

  const ssPrefix = 'access-to-sidebar-';

  describe('Test PageCreateButton', () => {
    beforeEach(() => {
      cy.getByTestid('grw-sidebar-nav-page-create-button').should('be.visible')
        .then($elem => {
          if (!$elem.hasClass('active')) {
            cy.getByTestid('grw-sidebar-nav-page-create-button').click();
          }
        })
    });

    it('Successfully create untitled page', () => {
      cy.visit('/');

      cy.getByTestid('grw-sidebar-nav-page-create-button').click();

      cy.getByTestid('page-editor').should('be.visible');
      cy.getByTestid('save-page-btn').as('save-page-btn').should('be.visible');

      cy.screenshot(`${ssPrefix}create-untitled-page`);
    });
  });

  describe('Test PageCreateButton dropdown', () => {

    it('Successfully create untitled page', () => {});
    it("Successfully create today's page", () => {});
    it('Successfully create children template', () => {});
    it('Successfully create descendants template', () => {});

  });
});
