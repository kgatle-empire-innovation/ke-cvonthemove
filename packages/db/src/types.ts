export type TemplateType = 'modern' | 'classic' | 'professional';

export interface BaseTemplateProps {
  type: TemplateType;
}

export interface ModernTemplateProps extends BaseTemplateProps {
  type: 'modern';
  primaryColor: string;
  hasSidebar: boolean;
}

export interface ClassicTemplateProps extends BaseTemplateProps {
  type: 'classic';
  fontFamily: string;
}

export interface ProfessionalTemplateProps extends BaseTemplateProps {
  type: 'professional';
  accentColor: string;
  showPhoto: boolean;
}

export type TemplateProperties = ModernTemplateProps | ClassicTemplateProps | ProfessionalTemplateProps;
