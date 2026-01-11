import { Upload, Settings, Download, Trash2 } from "lucide-react";

const steps = [
  {
    icon: Upload,
    title: "Upload",
    description: "Send your file to the tool",
  },
  {
    icon: Settings,
    title: "Configure",
    description: "Adjust the options as needed",
  },
  {
    icon: Download,
    title: "Download",
    description: "Download the result",
  },
  {
    icon: Trash2,
    title: "Insurance",
    description: "We automatically deleted your files",
  },
];

export const HowItWorks = () => {
  return (
    <section className="py-16 bg-card">
      <div className="container px-4 mx-auto">
        <div className="mb-12 text-center">
          <h2 className="mb-3 text-2xl font-bold md:text-3xl text-foreground">How it works</h2>
          <p className="text-muted-foreground">It's that simple. In 4 steps you can complete any mission.</p>
        </div>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((step) => (
            <div key={step.title} className="text-center">
              <div className="inline-flex items-center justify-center mb-4 border rounded-full w-14 h-14 bg-secondary border-primary/20">
                <step.icon className="w-6 h-6 text-primary" />
              </div>
              <h3 className="mb-2 text-base font-semibold text-foreground">{step.title}</h3>
              <p className="text-sm text-muted-foreground">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
