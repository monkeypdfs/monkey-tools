"use client";

import { Upload } from "lucide-react";
import { DynamicIcon, type IconName } from "lucide-react/dynamic";

interface HowItWorksStep {
  iconName: string;
  title: string;
  description: string;
  order: number;
}

interface HowItWorksSection {
  title: string;
  subtitle: string;
  steps: HowItWorksStep[];
}

interface HowItWorksProps {
  howItWorksSection?: HowItWorksSection;
}

export const HowItWorks = ({ howItWorksSection }: HowItWorksProps) => {
  // Fallback to default content if not provided
  const defaultSteps = [
    {
      iconName: "Upload",
      title: "Envie seu arquivo",
      description: "Arraste ou selecione o arquivo que deseja processar",
      order: 0,
    },
    {
      iconName: "Settings",
      title: "Processamento automático",
      description: "Nossa ferramenta processa seu arquivo em segundos",
      order: 1,
    },
    {
      iconName: "Download",
      title: "Baixe o resultado",
      description: "Faça o download do arquivo processado gratuitamente",
      order: 2,
    },
  ];

  const content = howItWorksSection || {
    title: "Como Funciona",
    subtitle: "Três passos simples para usar qualquer ferramenta",
    steps: defaultSteps,
  };

  // Sort steps by order and take only first 3
  const sortedSteps = [...content.steps].sort((a, b) => a.order - b.order).slice(0, 3);

  return (
    <section className="py-20 bg-card">
      <div className="container px-4 mx-auto">
        <div className="mb-16 text-center">
          <h2 className="mb-4 text-3xl font-bold md:text-4xl text-foreground">{content.title}</h2>
          <p className="text-lg text-muted-foreground">{content.subtitle}</p>
        </div>
        <div className="grid grid-cols-1 gap-12 md:grid-cols-3 max-w-5xl mx-auto">
          {sortedSteps.map((step, index) => {
            return (
              <div key={step.title} className="text-center">
                <div className="relative inline-flex items-center justify-center mb-6">
                  {/* Icon Container */}
                  <div className="w-20 h-20 rounded-2xl bg-muted flex items-center justify-center">
                    <DynamicIcon
                      name={step.iconName as IconName}
                      className="w-10 h-10 text-primary"
                      fallback={() => <Upload className="w-10 h-10 text-primary" />}
                    />
                  </div>
                  {/* Number Badge */}
                  <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-secondary text-background flex items-center justify-center font-bold text-sm">
                    {index + 1}
                  </div>
                </div>
                <h3 className="mb-3 text-xl font-semibold text-foreground">{step.title}</h3>
                <p className="text-base text-muted-foreground">{step.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
