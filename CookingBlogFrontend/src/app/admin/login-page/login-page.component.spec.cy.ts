import { mount } from "cypress/angular";
import { LoginPageComponent } from "./login-page.component";
import { ReactiveFormsModule } from '@angular/forms';
import { of } from 'rxjs';
import { AuthService } from "../../shared/services/auth/auth.service";
import { AuthErrorService } from "../shared/services/auth-error/auth-error.service";

const MockAuthErrorService = {
  errors$: of(null),
};

const MockAuthService = {
  login: () => { },
};

describe('LoginPageComponent Validation', () => {

  beforeEach(() => {
    mount(LoginPageComponent, {
      imports: [
        ReactiveFormsModule,
      ],
      providers: [
        { provide: AuthService, useValue: MockAuthService },
        { provide: AuthErrorService, useValue: MockAuthErrorService },
      ]
    });
  });

  it('should show "required" error for username field on blur', () => {
    cy.get('[data-cy="username-input"]').focus().blur();

    cy.get('[data-cy="username-container"]')
      .should('have.class', 'invalid');

    cy.get('[data-cy="username-error-message"]')
      .should('be.visible')
      .and('contain', 'Field username is required');

    cy.get('[data-cy="login-button"]').should('be.disabled');
  });

  it('should display required length error when username is too short', () => {

    cy.get('[data-cy="username-input"]').type('ad').blur();
    cy.intercept('POST', '/api/auth/login').as('loginAttempt');

    cy.get('[data-cy="login-button"]').click({ force: true });
    cy.get('@loginAttempt', { timeout: 0 }).should('not.exist');

    cy.get('[data-cy="login-button"]').should('be.disabled');

    cy.get('[data-cy="username-error-message"]')
      .should('be.visible');
  });

  it('should show "required" error for password field on blur', () => {
    cy.get('[data-cy="password-input"]').focus().blur();

    cy.get('[data-cy="password-container"]')
      .should('have.class', 'invalid');

    cy.get('[data-cy="password-error-message"]')
      .should('be.visible')
      .and('contain', 'Field password is required');

    cy.get('[data-cy="login-button"]').should('be.disabled');
  });

  it('should display required length error when password is too short', () => {

    cy.get('[data-cy="password-input"]').type('123').blur();
    cy.intercept('POST', '/api/auth/login').as('loginAttempt');

    cy.get('[data-cy="login-button"]').click({ force: true });
    cy.get('@loginAttempt', { timeout: 0 }).should('not.exist');

    cy.get('[data-cy="login-button"]').should('be.disabled');

    cy.get('[data-cy="password-error-message"]')
      .should('be.visible');
  });

  it('should enable login button when form is valid', () => {
    cy.get('[data-cy="username-input"]').type('validuser');
    cy.get('[data-cy="password-input"]').type('validpass');

    cy.get('[data-cy="login-button"]').should('not.be.disabled');
  });

});