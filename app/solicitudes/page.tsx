"use client";

"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface UsuarioSesion {
  id: string;
  nombre: string;
  email: string;
  role: "admin" | "usuario";
}

interface Solicitud {
  id: string;
  userId: string;
  userEmail: string;
  titulo: string;
  descripcion: string;
  tipo: "soporte" | "permiso" | "requerimiento";
  estado: "abierta" | "en_proceso" | "cerrada";
  createdAt: string;
  updatedAt: string;
}

interface RespuestaSolicitudes {
  solicitudes?: Solicitud[];
  solicitud?: Solicitud;
  message?: string;
}

export default function SolicitudesPage() {
  const router = useRouter();

  const [user, setUser] = useState<UsuarioSesion | null>(null);
  const [solicitudes, setSolicitudes] = useState<Solicitud[]>([]);

  const [loading, setLoading] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [actualizando, setActualizando] = useState(false);
  const [eliminandoId, setEliminandoId] = useState<string | null>(null);

  const [error, setError] = useState("");
  const [mensaje, setMensaje] = useState("");

  // Formulario para crear
  const [titulo, setTitulo] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [tipo, setTipo] =
    useState<Solicitud["tipo"]>("soporte");

  // Formulario para editar
  const [editandoId, setEditandoId] =
    useState<string | null>(null);

  const [editTitulo, setEditTitulo] = useState("");
  const [editDescripcion, setEditDescripcion] = useState("");

  const [editTipo, setEditTipo] =
    useState<Solicitud["tipo"]>("soporte");

  const [editEstado, setEditEstado] =
    useState<Solicitud["estado"]>("abierta");

  useEffect(() => {
    const cargarSolicitudes = async () => {
      const token = localStorage.getItem("token");
      const storedUser = localStorage.getItem("user");

      if (!token || !storedUser) {
        router.replace("/login");
        return;
      }

      try {
        const parsedUser =
          JSON.parse(storedUser) as UsuarioSesion;

        if (
          !parsedUser.id ||
          !parsedUser.email ||
          !parsedUser.role
        ) {
          throw new Error(
            "Información de usuario incompleta"
          );
        }

        const response = await fetch("/api/solicitudes", {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            role: parsedUser.role,
            userid: parsedUser.id,
          },
        });

        const data =
          (await response.json()) as RespuestaSolicitudes;

        if (!response.ok) {
          throw new Error(
            data.message ||
              "Error al cargar las solicitudes"
          );
        }

        setUser(parsedUser);
        setSolicitudes(data.solicitudes || []);
      } catch (error) {
        console.error(
          "Error al cargar solicitudes:",
          error
        );

        if (
          error instanceof SyntaxError ||
          (error instanceof Error &&
            error.message ===
              "Información de usuario incompleta")
        ) {
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          router.replace("/login");
          return;
        }

        setError(
          error instanceof Error
            ? error.message
            : "No se pudieron cargar las solicitudes"
        );
      } finally {
        setLoading(false);
      }
    };

    void cargarSolicitudes();
  }, [router]);

  const crearSolicitud = async (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    setMensaje("");
    setError("");

    if (!titulo.trim() || !descripcion.trim()) {
      setError(
        "El título y la descripción son obligatorios."
      );
      return;
    }

    const token = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");

    if (!token || !storedUser) {
      router.replace("/login");
      return;
    }

    try {
      setGuardando(true);

      const parsedUser =
        JSON.parse(storedUser) as UsuarioSesion;

      const response = await fetch("/api/solicitudes", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          role: parsedUser.role,
          userid: parsedUser.id,
        },
        body: JSON.stringify({
          titulo: titulo.trim(),
          descripcion: descripcion.trim(),
          tipo,
          userId: parsedUser.id,
          userEmail: parsedUser.email,
        }),
      });

      const data =
        (await response.json()) as RespuestaSolicitudes;

      if (!response.ok) {
        throw new Error(
          data.message || "Error al crear solicitud"
        );
      }

      if (data.solicitud) {
        setSolicitudes((solicitudesActuales) => [
          data.solicitud as Solicitud,
          ...solicitudesActuales,
        ]);
      }

      setTitulo("");
      setDescripcion("");
      setTipo("soporte");
      setMensaje("Solicitud creada correctamente.");
    } catch (error) {
      console.error("Error al crear solicitud:", error);

      setError(
        error instanceof Error
          ? error.message
          : "Error de conexión al crear la solicitud"
      );
    } finally {
      setGuardando(false);
    }
  };

  const iniciarEdicion = (solicitud: Solicitud) => {
    setEditandoId(solicitud.id);
    setEditTitulo(solicitud.titulo);
    setEditDescripcion(solicitud.descripcion);
    setEditTipo(solicitud.tipo);
    setEditEstado(solicitud.estado);
    setMensaje("");
    setError("");
  };

  const cancelarEdicion = () => {
    setEditandoId(null);
    setEditTitulo("");
    setEditDescripcion("");
    setEditTipo("soporte");
    setEditEstado("abierta");
    setError("");
  };

  const guardarEdicion = async (id: string) => {
    setMensaje("");
    setError("");

    if (
      !editTitulo.trim() ||
      !editDescripcion.trim()
    ) {
      setError(
        "El título y la descripción son obligatorios."
      );
      return;
    }

    const token = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");

    if (!token || !storedUser) {
      router.replace("/login");
      return;
    }

    try {
      setActualizando(true);

      const parsedUser =
        JSON.parse(storedUser) as UsuarioSesion;

      const response = await fetch(
        `/api/solicitudes/${id}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
            role: parsedUser.role,
            userid: parsedUser.id,
          },
          body: JSON.stringify({
            titulo: editTitulo.trim(),
            descripcion: editDescripcion.trim(),
            tipo: editTipo,
            estado: editEstado,
          }),
        }
      );

      const data =
        (await response.json()) as RespuestaSolicitudes;

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Error al actualizar la solicitud"
        );
      }

      if (data.solicitud) {
        const solicitudActualizada = data.solicitud;

        setSolicitudes((solicitudesActuales) =>
          solicitudesActuales.map((solicitud) =>
            solicitud.id === id
              ? solicitudActualizada
              : solicitud
          )
        );
      }

      setEditandoId(null);
      setEditTitulo("");
      setEditDescripcion("");
      setEditTipo("soporte");
      setEditEstado("abierta");

      setMensaje(
        "Solicitud actualizada correctamente."
      );
    } catch (error) {
      console.error(
        "Error al actualizar solicitud:",
        error
      );

      setError(
        error instanceof Error
          ? error.message
          : "Error de conexión al actualizar la solicitud"
      );
    } finally {
      setActualizando(false);
    }
  };

  const eliminarSolicitud = async (id: string) => {
    const confirmar = window.confirm(
      "¿Estás seguro de que deseas eliminar esta solicitud?"
    );

    if (!confirmar) {
      return;
    }

    setMensaje("");
    setError("");

    const token = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");

    if (!token || !storedUser) {
      router.replace("/login");
      return;
    }

    try {
      setEliminandoId(id);

      const parsedUser =
        JSON.parse(storedUser) as UsuarioSesion;

      const response = await fetch(
        `/api/solicitudes/${id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
            role: parsedUser.role,
            userid: parsedUser.id,
          },
        }
      );

      const data =
        (await response.json()) as RespuestaSolicitudes;

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Error al eliminar la solicitud"
        );
      }

      setSolicitudes((solicitudesActuales) =>
        solicitudesActuales.filter(
          (solicitud) => solicitud.id !== id
        )
      );

      if (editandoId === id) {
        cancelarEdicion();
      }

      setMensaje(
        "Solicitud eliminada correctamente."
      );
    } catch (error) {
      console.error(
        "Error al eliminar solicitud:",
        error
      );

      setError(
        error instanceof Error
          ? error.message
          : "Error de conexión al eliminar la solicitud"
      );
    } finally {
      setEliminandoId(null);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    router.replace("/login");
  };

  if (loading) {
    return (
      <p style={{ padding: "2rem" }}>
        Cargando solicitudes...
      </p>
    );
  }

  if (!user) {
    return (
      <p style={{ padding: "2rem" }}>
        Verificando sesión...
      </p>
    );
  }

  return (
    <main
      style={{
        maxWidth: "900px",
        margin: "0 auto",
        padding: "2rem",
      }}
    >
      <h1>Gestión de Solicitudes</h1>

      <p>Bienvenido, {user.nombre}</p>
      <p>Rol: {user.role}</p>

      <button
        type="button"
        onClick={handleLogout}
        style={{
          marginTop: "10px",
          padding: "8px 14px",
          cursor: "pointer",
        }}
      >
        Cerrar sesión
      </button>

      <hr style={{ margin: "24px 0" }} />

      <section>
        <h2>Crear nueva solicitud</h2>

        <form
          onSubmit={crearSolicitud}
          style={{
            display: "grid",
            gap: "12px",
            marginTop: "16px",
            marginBottom: "24px",
          }}
        >
          <label htmlFor="titulo">Título</label>

          <input
            id="titulo"
            type="text"
            value={titulo}
            onChange={(event) =>
              setTitulo(event.target.value)
            }
            placeholder="Escribe el título"
            disabled={guardando}
            style={{
              padding: "10px",
              border: "1px solid #aaa",
              borderRadius: "4px",
            }}
          />

          <label htmlFor="descripcion">
            Descripción
          </label>

          <textarea
            id="descripcion"
            value={descripcion}
            onChange={(event) =>
              setDescripcion(event.target.value)
            }
            placeholder="Describe tu solicitud"
            rows={4}
            disabled={guardando}
            style={{
              padding: "10px",
              border: "1px solid #aaa",
              borderRadius: "4px",
              resize: "vertical",
            }}
          />

          <label htmlFor="tipo">
            Tipo de solicitud
          </label>

          <select
            id="tipo"
            value={tipo}
            onChange={(event) =>
              setTipo(
                event.target.value as Solicitud["tipo"]
              )
            }
            disabled={guardando}
            style={{
              padding: "10px",
              border: "1px solid #aaa",
              borderRadius: "4px",
            }}
          >
            <option value="soporte">Soporte</option>
            <option value="permiso">Permiso</option>
            <option value="requerimiento">
              Requerimiento
            </option>
          </select>

          <button
            type="submit"
            disabled={guardando}
            style={{
              padding: "10px 16px",
              cursor: guardando
                ? "not-allowed"
                : "pointer",
            }}
          >
            {guardando
              ? "Guardando..."
              : "Crear solicitud"}
          </button>
        </form>
      </section>

      {mensaje && (
        <p style={{ color: "green" }}>{mensaje}</p>
      )}

      {error && (
        <p style={{ color: "red" }}>{error}</p>
      )}

      <hr style={{ margin: "24px 0" }} />

      <section>
        <h2>Listado de solicitudes</h2>

        {solicitudes.length === 0 ? (
          <p>No hay solicitudes registradas.</p>
        ) : (
          <div style={{ marginTop: "16px" }}>
            {solicitudes.map((solicitud) => (
              <article
                key={solicitud.id}
                style={{
                  border: "1px solid #ccc",
                  borderRadius: "6px",
                  padding: "16px",
                  marginBottom: "14px",
                }}
              >
                {editandoId === solicitud.id ? (
                  <div
                    style={{
                      display: "grid",
                      gap: "10px",
                    }}
                  >
                    <h3>Editar solicitud</h3>

                    <label
                      htmlFor={`edit-titulo-${solicitud.id}`}
                    >
                      Título
                    </label>

                    <input
                      id={`edit-titulo-${solicitud.id}`}
                      type="text"
                      value={editTitulo}
                      onChange={(event) =>
                        setEditTitulo(event.target.value)
                      }
                      disabled={actualizando}
                      style={{ padding: "8px" }}
                    />

                    <label
                      htmlFor={`edit-descripcion-${solicitud.id}`}
                    >
                      Descripción
                    </label>

                    <textarea
                      id={`edit-descripcion-${solicitud.id}`}
                      value={editDescripcion}
                      onChange={(event) =>
                        setEditDescripcion(
                          event.target.value
                        )
                      }
                      rows={4}
                      disabled={actualizando}
                      style={{ padding: "8px" }}
                    />

                    <label
                      htmlFor={`edit-tipo-${solicitud.id}`}
                    >
                      Tipo
                    </label>

                    <select
                      id={`edit-tipo-${solicitud.id}`}
                      value={editTipo}
                      onChange={(event) =>
                        setEditTipo(
                          event.target
                            .value as Solicitud["tipo"]
                        )
                      }
                      disabled={actualizando}
                      style={{ padding: "8px" }}
                    >
                      <option value="soporte">
                        Soporte
                      </option>

                      <option value="permiso">
                        Permiso
                      </option>

                      <option value="requerimiento">
                        Requerimiento
                      </option>
                    </select>

                    <label
                      htmlFor={`edit-estado-${solicitud.id}`}
                    >
                      Estado
                    </label>

                    <select
                      id={`edit-estado-${solicitud.id}`}
                      value={editEstado}
                      onChange={(event) =>
                        setEditEstado(
                          event.target
                            .value as Solicitud["estado"]
                        )
                      }
                      disabled={actualizando}
                      style={{ padding: "8px" }}
                    >
                      <option value="abierta">
                        Abierta
                      </option>

                      <option value="en_proceso">
                        En proceso
                      </option>

                      <option value="cerrada">
                        Cerrada
                      </option>
                    </select>

                    <div
                      style={{
                        display: "flex",
                        gap: "10px",
                        marginTop: "8px",
                      }}
                    >
                      <button
                        type="button"
                        onClick={() =>
                          void guardarEdicion(
                            solicitud.id
                          )
                        }
                        disabled={actualizando}
                        style={{
                          padding: "8px 14px",
                          cursor: actualizando
                            ? "not-allowed"
                            : "pointer",
                        }}
                      >
                        {actualizando
                          ? "Actualizando..."
                          : "Guardar"}
                      </button>

                      <button
                        type="button"
                        onClick={cancelarEdicion}
                        disabled={actualizando}
                        style={{
                          padding: "8px 14px",
                          cursor: actualizando
                            ? "not-allowed"
                            : "pointer",
                        }}
                      >
                        Cancelar
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <h3>{solicitud.titulo}</h3>

                    <p>{solicitud.descripcion}</p>

                    <p>
                      <strong>Tipo:</strong>{" "}
                      {solicitud.tipo}
                    </p>

                    <p>
                      <strong>Estado:</strong>{" "}
                      {solicitud.estado}
                    </p>

                    <p>
                      <strong>Usuario:</strong>{" "}
                      {solicitud.userEmail}
                    </p>

                    <div
                      style={{
                        display: "flex",
                        gap: "10px",
                        marginTop: "12px",
                      }}
                    >
                      <button
                        type="button"
                        onClick={() =>
                          iniciarEdicion(solicitud)
                        }
                        disabled={eliminandoId !== null}
                        style={{
                          padding: "8px 14px",
                          cursor: "pointer",
                        }}
                      >
                        Editar
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          void eliminarSolicitud(
                            solicitud.id
                          )
                        }
                        disabled={
                          eliminandoId === solicitud.id
                        }
                        style={{
                          padding: "8px 14px",
                          cursor:
                            eliminandoId === solicitud.id
                              ? "not-allowed"
                              : "pointer",
                        }}
                      >
                        {eliminandoId === solicitud.id
                          ? "Eliminando..."
                          : "Eliminar"}
                      </button>
                    </div>
                  </>
                )}
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}