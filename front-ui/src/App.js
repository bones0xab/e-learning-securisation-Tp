import React, { useEffect, useState } from "react";
import ApiService from "./apiService";
import keycloakService from "./KeycloakService";
import "./App.css";

function App() {
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [userClaims, setUserClaims] = useState(null);
    const [isAdmin, setIsAdmin] = useState(false);

    // Form state for creating a course
    const [courseName, setCourseName] = useState("");
    const [courseDescription, setCourseDescription] = useState("");
    const [saving, setSaving] = useState(false);

    // Récupérer la liste des cours
    const fetchCourses = async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await ApiService.getCourses();
            setCourses(res.data);
        } catch (err) {
            console.error("Erreur getCourses:", err);
            setError("Impossible de récupérer les cours. Vérifiez le backend.");
        } finally {
            setLoading(false);
        }
    };

    // Récupérer les claims (me) pour déterminer les rôles utilisateur
    const fetchMe = async () => {
        try {
            const res = await ApiService.getMe();
            const claims = res.data || {};
            setUserClaims(claims);

            // Deux possibilités courantes : claim 'roles' (array) ou realm_access.roles
            const roles =
                claims.roles ||
                (claims.realm_access && claims.realm_access.roles) ||
                [];
            const normalized = Array.isArray(roles) ? roles : [];
            // Dans le backend, on mappe vers ROLE_ADMIN but here we check both forms:
            const adminDetected =
                normalized.includes("admin") ||
                normalized.includes("ADMIN") ||
                normalized.includes("ROLE_ADMIN");
            setIsAdmin(adminDetected);
        } catch (err) {
            console.error("Erreur getMe:", err);
            // Pas bloquant : on laisse userClaims null
        }
    };

    useEffect(() => {
        // Si on n'est pas authentifié, forcer login via keycloakService
        if (!keycloakService.authenticated) {
            // keycloakService.init() et login sont gérés dans index.js, mais on laisse une option
            console.warn("Utilisateur non authentifié côté client (keycloakService).");
        }

        fetchCourses();
        fetchMe();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleCreateCourse = async (e) => {
        e.preventDefault();
        setSaving(true);
        setError(null);

        const payload = {
            courseName: courseName.trim(),
            courseDescription: courseDescription.trim(),
        };

        if (!payload.courseName) {
            setError("Le nom du cours est requis.");
            setSaving(false);
            return;
        }

        try {
            await ApiService.createCourses(payload);
            setCourseName("");
            setCourseDescription("");
            await fetchCourses();
        } catch (err) {
            console.error("Erreur createCourses:", err);
            setError(
                err?.response?.data || "Erreur lors de la création du cours (vérifier les droits)."
            );
        } finally {
            setSaving(false);
        }
    };

    const handleLogout = async () => {
        try {
            await keycloakService.logout();
        } catch (err) {
            console.error("Erreur logout:", err);
            // fallback : reload
            window.location.reload();
        }
    };

    const handleLogin = async () => {
        try {
            await keycloakService.login();
        } catch (err) {
            console.error("Erreur login:", err);
            alert("Impossible de lancer l'authentification");
        }
    };

    return (
        <div className="app-root">
            <header className="app-header">
                <h1>Plateforme de cours — EXAMPLE</h1>
                <div className="header-actions">
                    <button onClick={() => { fetchCourses(); fetchMe(); }} className="btn small">Actualiser</button>
                    {keycloakService.authenticated ? (
                        <button onClick={handleLogout} className="btn small danger">Se déconnecter</button>
                    ) : (
                        <button onClick={handleLogin} className="btn small">Se connecter</button>
                    )}
                </div>
            </header>

            <main className="app-main">
                <section className="panel">
                    <h2>Mon profil</h2>
                    {userClaims ? (
                        <div className="profile">
                            <p><strong>Username / sub :</strong> {userClaims.preferred_username || userClaims.sub || "—"}</p>
                            <p><strong>Claims reçus :</strong></p>
                            <pre className="claims-block">{JSON.stringify(userClaims, null, 2)}</pre>
                            <p>
                                <strong>Rôle détecté :</strong> {isAdmin ? "ADMIN" : "STUDENT / AUTRE"}
                            </p>
                        </div>
                    ) : (
                        <p>Informations utilisateur indisponibles (non authentifié ou erreur).</p>
                    )}
                </section>

                <section className="panel">
                    <h2>Liste des cours</h2>
                    {loading ? (
                        <p>Chargement...</p>
                    ) : error ? (
                        <div className="error">{error}</div>
                    ) : (
                        <>
                            {Array.isArray(courses) && courses.length > 0 ? (
                                <ul className="courses-list">
                                    {courses.map((c) => (
                                        <li key={c.courseId} className="course-item">
                                            <h3>{c.courseName}</h3>
                                            <p>{c.courseDescription}</p>
                                            <small>ID: {c.courseId}</small>
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <p>Aucun cours disponible.</p>
                            )}
                        </>
                    )}
                </section>

                <section className="panel">
                    <h2>Créer un cours</h2>
                    {isAdmin ? (
                        <form className="course-form" onSubmit={handleCreateCourse}>
                            <label>
                                Nom du cours
                                <input
                                    type="text"
                                    value={courseName}
                                    onChange={(e) => setCourseName(e.target.value)}
                                    placeholder="Ex: Introduction à la cybersécurité"
                                />
                            </label>

                            <label>
                                Description
                                <textarea
                                    value={courseDescription}
                                    onChange={(e) => setCourseDescription(e.target.value)}
                                    placeholder="Description courte du cours"
                                ></textarea>
                            </label>

                            <div className="form-actions">
                                <button type="submit" className="btn" disabled={saving}>
                                    {saving ? "Enregistrement..." : "Créer"}
                                </button>
                            </div>
                            {error && <div className="error">{error}</div>}
                        </form>
                    ) : (
                        <p>Vous n'avez pas les droits pour créer un cours (ROLE_ADMIN requis).</p>
                    )}
                </section>
            </main>

            <footer className="app-footer">
                <small>Frontend React connecté au backend Spring (Keycloak + JWT). </small>
                <small>Si vous avez des problèmes CORS, vérifiez `SecurityConfig.corsConfigurationSource()` côté backend.</small>
            </footer>
        </div>
    );
}

export default App;
