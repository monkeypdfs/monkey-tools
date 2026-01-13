"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@workspace/ui/components/button";
import { Card } from "@workspace/ui/components/card";
import { Label } from "@workspace/ui/components/label";
import { Switch } from "@workspace/ui/components/switch";
import { Input } from "@workspace/ui/components/input";
import { RefreshCw, Copy, GripHorizontal, ShieldCheck } from "lucide-react";

type BrazilianAddress = {
  cep: string;
  street: string;
  number: number;
  neighborhood: string;
  city: string;
  state: string;
};

// Region-based configuration for realistic (but synthetic) data
const REGIONAL_DATA = [
  {
    prefixes: ["0"],
    start: 0,
    end: 19999, // SP
    states: [{ code: "SP", cities: ["São Paulo", "Guarulhos", "Osasco", "Santo André"] }],
  },
  {
    prefixes: ["1"],
    start: 10000,
    end: 19999, // SP Interior
    states: [{ code: "SP", cities: ["Campinas", "Sorocaba", "Ribeirão Preto", "Santos", "São José dos Campos"] }],
  },
  {
    prefixes: ["2"], // RJ, ES
    states: [
      { code: "RJ", cities: ["Rio de Janeiro", "Niterói", "Duque de Caxias", "São Gonçalo"] },
      { code: "ES", cities: ["Vitória", "Vila Velha", "Serra"] },
    ],
  },
  {
    prefixes: ["3"], // MG
    states: [{ code: "MG", cities: ["Belo Horizonte", "Contagem", "Uberlândia", "Juiz de Fora"] }],
  },
  {
    prefixes: ["4"], // BA, SE
    states: [
      { code: "BA", cities: ["Salvador", "Feira de Santana", "Vitória da Conquista"] },
      { code: "SE", cities: ["Aracaju", "Nossa Senhora do Socorro"] },
    ],
  },
  {
    prefixes: ["5"], // PE, AL, PB, RN
    states: [
      { code: "PE", cities: ["Recife", "Jaboatão dos Guararapes", "Olinda"] },
      { code: "AL", cities: ["Maceió", "Arapiraca"] },
      { code: "PB", cities: ["João Pessoa", "Campina Grande"] },
      { code: "RN", cities: ["Natal", "Mossoró"] },
    ],
  },
  {
    prefixes: ["6"], // CE, PI, MA, PA, AP, AM, RR, AC
    states: [
      { code: "CE", cities: ["Fortaleza", "Caucaia"] },
      { code: "MA", cities: ["São Luís", "Imperatriz"] },
      { code: "PA", cities: ["Belém", "Ananindeua"] },
      { code: "AM", cities: ["Manaus"] },
    ],
  },
  {
    prefixes: ["7"], // DF, GO, TO, MT, MS, RO
    states: [
      { code: "DF", cities: ["Brasília", "Taguatinga"] },
      { code: "GO", cities: ["Goiânia", "Aparecida de Goiânia"] },
      { code: "MT", cities: ["Cuiabá", "Várzea Grande"] },
      { code: "MS", cities: ["Campo Grande", "Dourados"] },
    ],
  },
  {
    prefixes: ["8"], // PR, SC
    states: [
      { code: "PR", cities: ["Curitiba", "Londrina", "Maringá"] },
      { code: "SC", cities: ["Florianópolis", "Joinville", "Blumenau"] },
    ],
  },
  {
    prefixes: ["9"], // RS
    states: [{ code: "RS", cities: ["Porto Alegre", "Caxias do Sul", "Canoas"] }],
  },
];

const STREET_NAMES = [
  "Rua das Flores",
  "Avenida Brasil",
  "Rua São José",
  "Avenida Paulista",
  "Rua XV de Novembro",
  "Rua Sete de Setembro",
  "Avenida Getúlio Vargas",
  "Rua Marechal Deodoro",
  "Rua Duque de Caxias",
  "Avenida Castelo Branco",
  "Rua da Paz",
  "Alameda dos Anjos",
  "Travessa do Comércio",
];

const NEIGHBORHOODS = [
  "Centro",
  "Jardim América",
  "Vila Nova",
  "Bela Vista",
  "Santa Cecília",
  "Jardim Europa",
  "Boa Vista",
  "São Cristóvão",
  "Vila Mariana",
  "Pinheiros",
  "Copacabana",
  "Ipanema",
  "Leblon",
  "Barra da Tijuca", // Mix of popular ones
];

export default function CepAddressGenerator() {
  const [address, setAddress] = useState<BrazilianAddress | null>(null);
  const [formatted, setFormatted] = useState(true);

  const generate = () => {
    // 1. Pick a Region
    const regionIndex = Math.floor(Math.random() * REGIONAL_DATA.length);
    const region = REGIONAL_DATA[regionIndex];
    if (!region) return;

    // 2. Pick a State from that Region
    const stateIndex = Math.floor(Math.random() * region.states.length);
    const stateData = region.states[stateIndex];
    if (!stateData) return;

    // 3. Pick a City
    const cityIndex = Math.floor(Math.random() * stateData.cities.length);
    const city = stateData.cities[cityIndex];
    if (!city) return;

    // 4. Generate CEP starting with the region prefix
    // Prefix (1 digit) + 4 random digits + 3 random digits
    // Note: To be industry standard valid format
    // Region code is first digit
    const prefix = region.prefixes[0];
    const suffix1 = Math.floor(Math.random() * 10000)
      .toString()
      .padStart(4, "0");
    const suffix2 = Math.floor(Math.random() * 1000)
      .toString()
      .padStart(3, "0");

    let cep = `${prefix}${suffix1}${suffix2}`;

    if (formatted) {
      cep = cep.replace(/^(\d{5})(\d{3})$/, "$1-$2");
    }

    setAddress({
      cep,
      street: STREET_NAMES[Math.floor(Math.random() * STREET_NAMES.length)] || "Rua Principal",
      number: Math.floor(Math.random() * 9000) + 1,
      neighborhood: NEIGHBORHOODS[Math.floor(Math.random() * NEIGHBORHOODS.length)] || "Centro",
      city,
      state: stateData.code,
    });
  };

  // Initial generation
  if (!address) {
    generate();
  }

  const handleCopyText = async () => {
    if (!address) return;
    const text = `${address.street}, ${address.number} - ${address.neighborhood}\n${address.city} - ${address.state}\nCEP: ${address.cep}`;
    try {
      await navigator.clipboard.writeText(text);
      toast.success("Address copied to clipboard");
    } catch {
      toast.error("Failed to copy address");
    }
  };

  const handleCopyJSON = async () => {
    if (!address) return;
    try {
      await navigator.clipboard.writeText(JSON.stringify(address, null, 2));
      toast.success("JSON copied to clipboard");
    } catch {
      toast.error("Failed to copy JSON");
    }
  };

  const toggleFormat = (checked: boolean) => {
    setFormatted(checked);
    if (address?.cep) {
      const cleanCep = address.cep.replace(/\D/g, "");
      const newCep = checked ? cleanCep.replace(/^(\d{5})(\d{3})$/, "$1-$2") : cleanCep;
      setAddress({ ...address, cep: newCep });
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <Card className="p-6 space-y-8 md:p-8">
        <div className="space-y-2">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <h2 className="flex items-center gap-2 text-xl font-bold">
              <ShieldCheck className="w-5 h-5 text-primary" />
              Generator
            </h2>
            <div className="flex items-center space-x-2">
              <Label htmlFor="cep-format" className="text-sm text-muted-foreground whitespace-nowrap">
                Format CEP
              </Label>
              <Switch id="cep-format" checked={formatted} onCheckedChange={toggleFormat} />
            </div>
          </div>
          <p className="text-sm text-muted-foreground">Generate realistic Brazilian addresses for testing purposes.</p>
        </div>

        {address ? (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div className="space-y-1.5">
              <Label className="text-xs tracking-wider uppercase text-muted-foreground">CEP</Label>
              <div className="relative">
                <Input value={address.cep} readOnly className="font-mono text-lg bg-muted/30" />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs tracking-wider uppercase text-muted-foreground">State / UF</Label>
              <Input value={address.state} readOnly className="bg-muted/30" />
            </div>

            <div className="md:col-span-2 space-y-1.5">
              <Label className="text-xs tracking-wider uppercase text-muted-foreground">City</Label>
              <Input value={address.city} readOnly className="bg-muted/30" />
            </div>

            <div className="md:col-span-2 space-y-1.5">
              <Label className="text-xs tracking-wider uppercase text-muted-foreground">Street Address</Label>
              <Input value={address.street} readOnly className="bg-muted/30" />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs tracking-wider uppercase text-muted-foreground">Number</Label>
              <Input value={address.number.toString()} readOnly className="bg-muted/30" />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs tracking-wider uppercase text-muted-foreground">Neighborhood</Label>
              <Input value={address.neighborhood} readOnly className="bg-muted/30" />
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center border-2 border-dashed rounded-lg h-60 bg-muted/10">
            <p className="text-muted-foreground">Click Generate to create an address</p>
          </div>
        )}

        <div className="flex flex-col gap-3 pt-4 border-t sm:flex-row">
          <Button onClick={generate} size="lg" className="flex-1 shadow-md">
            <RefreshCw className="w-4 h-4" />
            Generate New Address
          </Button>
          <div className="flex gap-3">
            <Button variant="outline" onClick={handleCopyText} className="flex-1 sm:flex-none">
              <Copy className="w-4 h-4" />
              Copy Text
            </Button>
            <Button variant="outline" onClick={handleCopyJSON} className="flex-1 sm:flex-none">
              <GripHorizontal className="w-4 h-4" />
              Copy JSON
            </Button>
          </div>
        </div>
      </Card>

      <div className="p-3 text-xs border rounded-md text-amber-600 bg-amber-50 border-amber-200 dark:bg-amber-950/30 dark:text-amber-400 dark:border-amber-900">
        <strong>⚠️ Disclaimer:</strong> Generated addresses are <strong>synthetic and for testing purposes only</strong>. While the
        CEP format is valid and mapped to the correct region/state, the specific street numbers and neighborhood combinations are
        randomized and may not exist physically. Do not use for real deliveries.
      </div>
    </div>
  );
}
