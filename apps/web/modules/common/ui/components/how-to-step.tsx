import { Upload } from "lucide-react";

interface Step {
  title: string;
  description: string;
}

interface HowToStepProps {
  title: string;
  subtitle: string;
  steps: Step[];
}

export const HowToStep = ({ title, subtitle, steps }: HowToStepProps) => {
  return (
    <section className="w-full py-6 my-10 bg-white md:py-9 md:my-20 dark:bg-background">
      <div className="container px-4 mx-auto">
        {/* Header */}
        <div className="mb-8 text-center md:mb-16">
          <h2 className="mb-3 text-2xl font-bold md:mb-4 md:text-3xl text-foreground">{title}</h2>
          <p className="text-base md:text-lg text-muted-foreground">{subtitle}</p>
        </div>

        {/* Steps Container */}
        <div className="relative max-w-5xl mx-auto">
          {/* Connecting Line (Desktop) */}
          <div
            className="absolute hidden w-full h-0.5 -translate-y-1/2 bg-gray-200 dark:bg-gray-800 top-1/2 md:block"
            aria-hidden="true"
          />

          <div className="grid grid-cols-1 gap-8 md:grid-cols-3 md:gap-8">
            {steps.map((step, index) => (
              <div key={step.title} className="relative flex flex-col items-center text-center group">
                {/* Icon Circle */}
                <div className="relative z-10 flex items-center justify-center w-16 h-16 mb-4 transition-transform duration-300 bg-blue-500 rounded-full shadow-lg md:w-20 md:h-20 md:mb-6 group-hover:scale-110 group-hover:bg-blue-600">
                  <Upload className="text-white size-5 md:size-6" />
                </div>

                {/* Step Badge */}
                <div className="relative z-10 px-3 py-1 my-4 text-xs font-bold text-gray-700 bg-gray-100 rounded-full md:px-4 md:mb-6 md:text-sm dark:bg-gray-800 dark:text-gray-300">
                  Step {index + 1}
                </div>

                {/* Description */}
                <p className="max-w-xs text-sm font-medium leading-relaxed md:text-base text-muted-foreground">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
