import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SimpleChange } from '@angular/core';
import { TemplateRendererComponent } from './template-renderer.component';
import { Template, ModernTemplateProps, ClassicTemplateProps, ProfessionalTemplateProps } from '@cvonthemove/db';

describe('TemplateRendererComponent', () => {
  let component: TemplateRendererComponent;
  let fixture: ComponentFixture<TemplateRendererComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TemplateRendererComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(TemplateRendererComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should parse modern template properties', () => {
    const modernProps: ModernTemplateProps = {
      type: 'modern',
      primaryColor: 'blue',
      hasSidebar: true
    };
    const template: Template = {
      id: '1',
      name: 'Modern Template',
      description: 'A modern template',
      type: 'modern',
      properties: modernProps as any,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    component.template = template;
    component.ngOnInit();

    expect(component.isModern).toBe(true);
    expect(component.isClassic).toBe(false);
    expect(component.isProfessional).toBe(false);
    expect(component.modernProps).toEqual(modernProps);
  });

  it('should parse classic template properties', () => {
    const classicProps: ClassicTemplateProps = {
      type: 'classic',
      fontFamily: 'Arial'
    };
    const template: Template = {
      id: '2',
      name: 'Classic Template',
      description: 'A classic template',
      type: 'classic',
      properties: classicProps as any,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    component.template = template;
    component.ngOnInit();

    expect(component.isClassic).toBe(true);
    expect(component.isModern).toBe(false);
    expect(component.isProfessional).toBe(false);
    expect(component.classicProps).toEqual(classicProps);
  });

  it('should parse professional template properties', () => {
    const professionalProps: ProfessionalTemplateProps = {
      type: 'professional',
      accentColor: 'green',
      showPhoto: true
    };
    const template: Template = {
      id: '3',
      name: 'Professional Template',
      description: 'A professional template',
      type: 'professional',
      properties: professionalProps as any,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    component.template = template;
    component.ngOnInit();

    expect(component.isProfessional).toBe(true);
    expect(component.isModern).toBe(false);
    expect(component.isClassic).toBe(false);
    expect(component.professionalProps).toEqual(professionalProps);
  });

  it('should update properties on template change', () => {
    const initialProps: ModernTemplateProps = {
      type: 'modern',
      primaryColor: 'blue',
      hasSidebar: true
    };
    const initialTemplate: Template = {
      id: '1',
      name: 'Modern Template',
      description: 'A modern template',
      type: 'modern',
      properties: initialProps as any,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    component.template = initialTemplate;
    component.ngOnInit();
    expect(component.isModern).toBe(true);

    const updatedProps: ClassicTemplateProps = {
      type: 'classic',
      fontFamily: 'Verdana'
    };
    const updatedTemplate: Template = {
      id: '2',
      name: 'Classic Template',
      description: 'An updated classic template',
      type: 'classic',
      properties: updatedProps as any,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    component.template = updatedTemplate;
    component.ngOnChanges({
      template: new SimpleChange(initialTemplate, updatedTemplate, false)
    });

    expect(component.isModern).toBe(false);
    expect(component.isClassic).toBe(true);
    expect(component.classicProps).toEqual(updatedProps);
  });
});
