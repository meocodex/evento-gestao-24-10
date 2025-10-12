import { LucideIcon } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface PlaceholderProps {
  icon: LucideIcon;
  title: string;
  description: string;
}

const Placeholder = ({ icon: Icon, title, description }: PlaceholderProps) => {
  return (
    <div className="min-h-screen p-6 bg-navy-50 dark:bg-navy-950">
      <div className="max-w-2xl mx-auto mt-12">
        <Card className="border-navy-200 dark:border-navy-800 bg-white dark:bg-navy-900">
          <CardHeader className="text-center">
            <div className="mx-auto p-4 bg-navy-100 dark:bg-navy-800 w-fit rounded-2xl mb-4">
              <Icon className="h-12 w-12 text-navy-600 dark:text-navy-400" />
            </div>
            <CardTitle className="text-2xl text-navy-900 dark:text-navy-50">{title}</CardTitle>
            <CardDescription className="text-base text-navy-600 dark:text-navy-400">{description}</CardDescription>
          </CardHeader>
          <CardContent className="text-center text-navy-600 dark:text-navy-400">
            Este módulo está em desenvolvimento e será implementado em breve.
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Placeholder;
