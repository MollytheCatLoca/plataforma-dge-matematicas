import { useSession } from 'next-auth/react';
// ...existing imports...

function Sidebar() {
  const { data: session, status } = useSession();

  if (status === 'loading') {
    return <div>Cargando...</div>; // o un spinner de carga
  }

  if (!session) {
    return <div>No se encontró sesión. Por favor inicia sesión.</div>;
  }

  const role = session.user?.role; // Asegúrate que en la estrategia de next-auth se exponga el rol

  return (
    <aside>
      <h2>Menu</h2>
      {role === 'DGE_ADMIN' && (
        <>
          {/* Opciones para DGE_ADMIN */}
          <div>Opción 1</div>
          <div>Opción 2</div>
        </>
      )}
      {role === 'SCHOOL_ADMIN' && (
        <>
          {/* Opciones para SCHOOL_ADMIN */}
          <div>Opción A</div>
          <div>Opción B</div>
        </>
      )}
      {/* ...otras opciones según el rol... */}
    </aside>
  );
}

export default Sidebar;
