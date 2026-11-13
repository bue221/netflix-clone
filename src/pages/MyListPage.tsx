import { StatusMessage } from '../components/StatusMessage/StatusMessage';
import { TitleGrid } from '../components/TitleGrid/TitleGrid';
import { useMyList } from '../state/myListStore';

export function MyListPage() {
  const { items } = useMyList();

  if (items.length === 0) {
    return (
      <StatusMessage heading="Tu lista está vacía">
        Agrega series y películas con el botón + para verlas aquí más tarde.
      </StatusMessage>
    );
  }

  return <TitleGrid heading="Mi lista" titles={items} />;
}
