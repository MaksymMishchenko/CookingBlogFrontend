import { mount } from "cypress/angular";
import { LoginPageComponent } from "../../src/app/admin/login-page/login-page.component";
import { ReactiveFormsModule } from '@angular/forms';
import { of, throwError } from 'rxjs';
import { AuthService } from "../../src/app/shared/services/auth/auth.service";
import { AuthError } from "../../src/app/shared/services/error/error.types";
import { Router, ActivatedRoute } from '@angular/router';
import { MobileAlertComponent } from "../../src/app/shared/components/mobile-alert/mobile-alert.component";
import { DesktopAlertComponent } from "../../src/app/shared/components/desktop-alert/desktop-alert.component";

describe('LoginPageComponent Validation', () => {

  let mockAuthService: { login: sinon.SinonStub };
  let mockRouter: { navigate: sinon.SinonStub };

  beforeEach(() => {
    mockAuthService = { login: cy.stub().returns(of({})) };
    mockRouter = { navigate: cy.stub() };

    mount(LoginPageComponent, {
      imports: [ReactiveFormsModule, MobileAlertComponent, DesktopAlertComponent],
      providers: [
        { provide: AuthService, useValue: mockAuthService },
        { provide: Router, useValue: mockRouter },
        { provide: ActivatedRoute, useValue: { queryParams: of({}) } },
      ]
    });
  });

  it('should show "required" error for username field on blur', () => {
    cy.get('[data-cy="username-input"]').focus().blur();
    cy.get('[data-cy="username-container"]').should('have.class', 'invalid');
    cy.get('[data-cy="username-error-message"]')
      .should('be.visible')
      .and('contain', 'Field username is required');
    cy.get('[data-cy="login-button"]').should('be.disabled');
  });

  it('should display minlength error when username is too short', () => {
    cy.get('[data-cy="username-input"]').type('ad').blur();
    cy.get('[data-cy="username-error-message"]')
      .should('be.visible')
      .and('contain', 'characters long');
    cy.get('[data-cy="login-button"]').should('be.disabled');
  });

  it('should show "required" error for password field on blur', () => {
    cy.get('[data-cy="password-input"]').focus().blur();
    cy.get('[data-cy="password-container"]').should('have.class', 'invalid');
    cy.get('[data-cy="password-error-message"]')
      .should('be.visible')
      .and('contain', 'Field password is required');
    cy.get('[data-cy="login-button"]').should('be.disabled');
  });

  it('should display minlength error when password is too short', () => {
    cy.get('[data-cy="password-input"]').type('123').blur();
    cy.get('[data-cy="password-error-message"]')
      .should('be.visible')
      .and('contain', 'symbols');
    cy.get('[data-cy="login-button"]').should('be.disabled');
  });

  it('should enable login button when form is valid', () => {
    cy.get('[data-cy="username-input"]').type('validuser');
    cy.get('[data-cy="password-input"]').type('validpass');
    cy.get('[data-cy="login-button"]').should('not.be.disabled');
  });

  it('should call auth.login and navigate on successful submit', () => {
    cy.get('[data-cy="username-input"]').type('validuser');
    cy.get('[data-cy="password-input"]').type('validpass');
    cy.get('[data-cy="login-button"]').click();
    cy.wrap(mockAuthService.login).should('have.been.calledOnce');
    cy.wrap(mockRouter.navigate).should('have.been.calledOnce');
  });

  it('should show error message on failed login', () => {
    const authError = new AuthError('Invalid credentials', 401, 'Invalid credentials', null, 'AUTH_001');
    mockAuthService = { login: cy.stub().returns(throwError(() => authError)) };

    mount(LoginPageComponent, {
      imports: [ReactiveFormsModule, MobileAlertComponent, DesktopAlertComponent],
      providers: [
        { provide: AuthService, useValue: mockAuthService },
        { provide: Router, useValue: mockRouter },
        { provide: ActivatedRoute, useValue: { queryParams: of({}) } },
      ]
    });

    cy.get('[data-cy="username-input"]').type('validuser');
    cy.get('[data-cy="password-input"]').type('validpass');
    cy.get('[data-cy="login-button"]').click();
    cy.get('[data-cy="error-message"]')
      .should('be.visible')
      .and('contain', 'Invalid credentials');
  });

  it('should show accessDenied message when query param is present', () => {
    mount(LoginPageComponent, {
      imports: [ReactiveFormsModule, MobileAlertComponent, DesktopAlertComponent],
      providers: [
        { provide: AuthService, useValue: mockAuthService },
        { provide: Router, useValue: mockRouter },
        { provide: ActivatedRoute, useValue: { queryParams: of({ accessDenied: true }) } },
      ]
    });

    cy.get('[data-cy="error-message"]').should('be.visible');
  });

});