import { format, parseISO } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';

export function formatDate(dateStr: string): string {
  return format(parseISO(dateStr), 'd MMM yyyy', {
    locale: ptBR,
  });
}
