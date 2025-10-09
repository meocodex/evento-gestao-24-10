import { LucideIcon } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface PlaceholderProps {
  icon: LucideIcon;
  title: string;
  description: string;
}

const Placeholder = ({ icon: Icon, title, description }: PlaceholderProps) => {
  return (
    <div className="p-6">
      <Card className="max-w-2xl mx-auto mt-12">
        <CardHeader className="text-center">
          <div className="mx-auto p-4 bg-primary/10 w-fit rounded-2xl mb-4">
            <Icon className="h-12 w-12 text-primary" />
          </div>
          <CardTitle className="text-2xl">{title}</CardTitle>
          <CardDescription className="text-base">{description}</CardDescription>
        </CardHeader>
        <CardContent className="text-center text-muted-foreground">
          Este módulo está em desenvolvimento e será implementado em breve.
        </CardContent>
      </Card>
    </div>
  );
};

export default Placeholder;
