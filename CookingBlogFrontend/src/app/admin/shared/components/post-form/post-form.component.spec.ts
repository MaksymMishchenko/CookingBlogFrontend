import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PostFormComponent } from './post-form.component';
import { ReactiveFormsModule } from '@angular/forms';
import { QuillModule } from 'ngx-quill';
import { validFormData } from '../../../../core/tests/fixtures/post.fixture';

describe('PostFormComponent', () => {
  let component: PostFormComponent;
  let fixture: ComponentFixture<PostFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PostFormComponent, ReactiveFormsModule, QuillModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(PostFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should not emit when form is invalid', () => {
    const spy = jasmine.createSpy();
    component.postSubmit.subscribe(spy);
    component.submit();
    expect(spy).not.toHaveBeenCalled();
  });

  it('should emit postSubmit with form data when valid', () => {
    const spy = jasmine.createSpy();
    component.postSubmit.subscribe(spy);

    component['form'].setValue(validFormData);

    component.submit();
    expect(spy).toHaveBeenCalledWith(jasmine.objectContaining({
      title: 'Test Title',
      slug: 'test-title',
      categoryId: 1
    }));
  });
});
