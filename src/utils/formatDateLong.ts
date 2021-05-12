import { format, parseISO } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';

export function formatDateLong(dateStr: string): string {
  try {
    return format(parseISO(dateStr), "'* editado em' d MMM yyyy', às' HH:mm", {
      locale: ptBR,
    });
  } catch {
    return '';
  }
}
