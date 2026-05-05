import { Component, Input, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Template, TemplateProperties, ModernTemplateProps, ClassicTemplateProps, ProfessionalTemplateProps } from '@cvonthemove/db';

@Component({
  selector: 'app-template-renderer',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './template-renderer.component.html',
  styleUrls: ['./template-renderer.component.css']
})
export class TemplateRendererComponent implements OnInit, OnChanges {
  @Input() template!: Template;

  properties!: TemplateProperties;

  ngOnInit() {
    this.parseProperties();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['template']) {
      this.parseProperties();
    }
  }

  private parseProperties() {
    if (this.template && this.template.properties) {
      // Cast the prisma JsonValue to our Discriminated Union type
      this.properties = this.template.properties as unknown as TemplateProperties;
    }
  }

  // Type guards for the template properties
  get isModern(): boolean {
    return this.properties?.type === 'modern';
  }
  
  get modernProps(): ModernTemplateProps {
    return this.properties as ModernTemplateProps;
  }

  get isClassic(): boolean {
    return this.properties?.type === 'classic';
  }

  get classicProps(): ClassicTemplateProps {
    return this.properties as ClassicTemplateProps;
  }

  get isProfessional(): boolean {
    return this.properties?.type === 'professional';
  }

  get professionalProps(): ProfessionalTemplateProps {
    return this.properties as ProfessionalTemplateProps;
  }
}
