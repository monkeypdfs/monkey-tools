import { SearchIcon } from "lucide-react";
import { Input } from "@workspace/ui/components/input";
import { Button } from "@workspace/ui/components/button";

export const SearchBar = () => {
  return (
    <div className="relative max-w-2xl mx-auto mb-16">
      <div className="relative flex items-center">
        <SearchIcon className="absolute w-5 h-5 left-4 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Search"
          className="w-full pl-12 pr-32 text-lg rounded-full shadow-sm h-14 border-border bg-background"
        />
        <Button className="absolute right-1.5 h-11 px-8 rounded-full bg-blue-500 hover:bg-blue-600 text-white font-semibold">
          Search
        </Button>
      </div>
    </div>
  );
};
