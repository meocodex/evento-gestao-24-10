import { useNotifications } from '@/hooks/useNotifications';
import { Card } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Bell, BellOff } from 'lucide-react';

export function NotificationSettings() {
  const { permission, isSubscribed, requestPermission, unsubscribe } = useNotifications();

  const handleToggle = async (enabled: boolean) => {
    if (enabled) {
      await requestPermission();
    } else {
      await unsubscribe();
    }
  };

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          {isSubscribed ? (
            <Bell className="h-5 w-5 text-primary" />
          ) : (
            <BellOff className="h-5 w-5 text-muted-foreground" />
          )}
          
          <div>
            <h3 className="font-semibold">Notificações Push</h3>
            <p className="text-sm text-muted-foreground">
              Receba alertas sobre demandas urgentes e novos eventos
            </p>
          </div>
        </div>

        <Switch
          checked={isSubscribed}
          onCheckedChange={handleToggle}
          disabled={permission === 'denied'}
        />
      </div>

      {permission === 'denied' && (
        <p className="text-sm text-destructive mt-2">
          Notificações bloqueadas. Habilite nas configurações do navegador.
        </p>
      )}
    </Card>
  );
}
