describe('Installer', () => {
  it('successfully loads', () => {
    cy.visit('http://localhost:3000'); // change URL to match your dev URL
    cy.screenshot('on-load');
  });
});
