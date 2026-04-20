// src/components/layout/Navbar.jsx — Swiggy/Zomato inspired sticky navbar

import { useState, useCallback, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { UtensilsCrossed, Menu, X, LogOut, LayoutDashboard, User, ChevronDown, Bell, CheckCircle2, XCircle, Ban, Utensils, ChefHat } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../hooks/useNotifications';
import { markNotificationRead, markAllRead } from '../../services/notificationService';
import UserAvatar from '../common/UserAvatar';
import toast from 'react-hot-toast';

export default function Navbar() {
  const { currentUser, userDoc, userRole, authLoading, logout } = useAuth();
  const navigate  = useNavigate();
  const location  = useLocation();
  const [mobileOpen,    setMobileOpen]    = useState(false);
  const [dropdownOpen,  setDropdownOpen]  = useState(false);
  const [notifOpen,     setNotifOpen]     = useState(false);
  const [scrolled,      setScrolled]      = useState(false);
  const dropdownRef = useRef(null);
  const notifRef    = useRef(null);

  // Real-time notifications (all logged-in users)
  const { notifications, unreadCount } = useNotifications(
    currentUser?.uid ?? null,
  );

  // Shadow on scroll
  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 8);
    window.addEventListener('scroll', handler, { passive: true });
    return () => window.removeEventListener('scroll', handler);
  }, []);

  useEffect(() => {
    if (!dropdownOpen && !notifOpen) return;
    const h = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) setDropdownOpen(false);
      if (notifRef.current    && !notifRef.current.contains(e.target))    setNotifOpen(false);
    };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, [dropdownOpen, notifOpen]);

  const handleLogout = useCallback(async () => {
    try { setDropdownOpen(false); await logout(); toast.success('See you soon!'); navigate('/'); }
    catch { toast.error('Logout failed'); }
  }, [logout, navigate]);

  const dashPath = userRole === 'provider' ? '/dashboard/provider' : '/dashboard/customer';
  const isActive = (to) => location.pathname === to || location.pathname.startsWith(to + '/');
  const showAuthedUI = !authLoading && !!currentUser;
  const showGuestUI  = !authLoading && !currentUser;
  const handleHowItWorks = useCallback((event) => {
    event.preventDefault();

    if (location.pathname === '/') {
      document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      return;
    }

    navigate('/', { state: { scrollTo: 'how-it-works' } });
  }, [location.pathname, navigate]);

  return (
    <>
      <nav style={{
        background: scrolled ? 'rgba(250,246,239,.92)' : 'rgba(250,246,239,.82)',
        borderBottom: '1px solid var(--border)',
        boxShadow: scrolled ? 'var(--shadow-md)' : 'var(--shadow-sm)',
        position: 'sticky', top: 0, zIndex: 40,
        transition: 'box-shadow .25s ease, background .25s ease',
        backdropFilter: 'blur(10px)',
      }}>
        <div className="page-container">
          <div className="nav-shell">

            {/* ── Logo ── */}
            <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '.7rem', textDecoration: 'none', flexShrink: 0 }}>
              <div style={{
                background: 'linear-gradient(135deg, var(--terracotta), var(--terracotta-dark))',
                padding: '.58rem', borderRadius: '.82rem',
                boxShadow: '0 8px 18px rgba(194,83,42,.22)',
                border: '1px solid rgba(194,83,42,.25)',
              }}>
                <UtensilsCrossed size={18} color="#fff" />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.05 }}>
                <span style={{
                  fontFamily: 'Nunito, sans-serif', fontWeight: 900, fontSize: '1.15rem',
                  color: 'var(--ink)',
                  letterSpacing: '.01em',
                }}>
                  TiffinConnect
                </span>
                <span style={{ fontSize: '.68rem', color: 'var(--ink-3)', fontWeight: 700, letterSpacing: '.08em', textTransform: 'uppercase' }}>
                  Home Tiffins, Daily
                </span>
              </div>
            </Link>

            {/* ── Desktop links (match original screenshot layout) ── */}
            <div className="nav-desktop nav-link-group">
              <Link
                to="/providers"
                className={`nav-link-pill ${isActive('/providers') ? 'active' : ''}`}
                onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--bg-warm)'; e.currentTarget.style.color = 'var(--ink)'; }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = isActive('/providers') ? 'var(--terracotta-pale)' : 'transparent';
                  e.currentTarget.style.color = isActive('/providers') ? 'var(--terracotta)' : 'var(--ink-2)';
                }}
              >
                Browse Tiffins
              </Link>

              <a
                href="#how-it-works"
                onClick={handleHowItWorks}
                className="nav-link-pill"
                onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--bg-warm)'; e.currentTarget.style.color = 'var(--ink)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--ink-2)'; }}
              >
                How it Works
              </a>
            </div>

            {/* ── Spacer ── */}
            <div style={{ flex: 1 }} />

            {/* ── Desktop right ── */}
            <div className="nav-desktop" style={{ alignItems: 'center', gap: '.75rem' }}>
              {showAuthedUI && (
                <>
                  {/* ── Notification Bell (all users) ── */}
                  {showAuthedUI && (
                    <div style={{ position: 'relative' }} ref={notifRef}>
                      <button
                        onClick={() => { setNotifOpen((o) => !o); setDropdownOpen(false); }}
                        id="notif-bell-btn"
                        style={{
                          position: 'relative', width: '38px', height: '38px', borderRadius: '50%',
                          border: `1.5px solid ${notifOpen ? 'rgba(194,83,42,.35)' : 'var(--border)'}`,
                          background: notifOpen ? 'var(--terracotta-pale)' : 'var(--bg-surface)',
                          cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                          transition: 'all .15s',
                        }}
                        aria-label="Notifications"
                      >
                        <Bell size={17} style={{ color: 'var(--ink-2)' }} />
                        {unreadCount > 0 && (
                          <span style={{
                            position: 'absolute', top: '-3px', right: '-3px',
                            minWidth: '18px', height: '18px', borderRadius: '9px',
                            background: 'var(--terracotta)', color: '#fff',
                            fontSize: '.65rem', fontWeight: 900, fontFamily: 'Nunito',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            padding: '0 4px', border: '2px solid var(--bg-surface)',
                          }}>
                            {unreadCount > 9 ? '9+' : unreadCount}
                          </span>
                        )}
                      </button>

                      {/* Notification dropdown */}
                      {notifOpen && (
                        <div style={{
                          position: 'absolute', top: 'calc(100% + 10px)', right: 0,
                          width: '340px', background: '#fff', borderRadius: '1.25rem',
                          border: '1px solid var(--border)', boxShadow: '0 16px 40px rgba(42,26,14,.16)',
                          zIndex: 50, overflow: 'hidden',
                        }}>
                          {/* Header */}
                          <div style={{
                            padding: '.85rem 1.1rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                            borderBottom: '1px solid var(--border-lt)',
                          }}>
                            <p style={{ fontFamily: 'Nunito', fontWeight: 800, fontSize: '.9rem', color: 'var(--ink)', display: 'inline-flex', alignItems: 'center', gap: '.4rem' }}>
                              <Bell size={14} style={{ color: 'var(--ink-2)' }} /> Notifications
                              {unreadCount > 0 && (
                                <span style={{ marginLeft: '.4rem', fontSize: '.72rem', background: 'var(--terracotta-pale)', color: 'var(--terracotta)', padding: '.1rem .45rem', borderRadius: '999px', fontWeight: 700 }}>
                                  {unreadCount} new
                                </span>
                              )}
                            </p>
                            {unreadCount > 0 && (
                              <button
                                onClick={async () => { await markAllRead(currentUser.uid); }}
                                style={{ fontSize: '.72rem', color: 'var(--terracotta)', fontWeight: 700, fontFamily: 'Nunito', background: 'none', border: 'none', cursor: 'pointer' }}
                              >
                                Mark all read
                              </button>
                            )}
                          </div>

                          {/* Notification list */}
                          <div style={{ maxHeight: '320px', overflowY: 'auto' }}>
                            {notifications.length === 0 ? (
                              <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--ink-3)', fontSize: '.85rem' }}>
                                <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 44, height: 44, borderRadius: '50%', background: 'var(--bg-warm)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-xs)', marginBottom: '.5rem', color: 'var(--ink-3)' }}>
                                  <Bell size={18} />
                                </div>
                                No notifications yet
                              </div>
                            ) : (
                              notifications.slice(0, 15).map((n) => (
                                <button
                                  key={n.id}
                                  onClick={async () => {
                                    if (!n.isRead) await markNotificationRead(n.id);
                                  setNotifOpen(false);
                                    navigate(userRole === 'provider' ? '/dashboard/provider' : '/dashboard/customer');
                                  }}
                                  style={{
                                    width: '100%', textAlign: 'left', padding: '.85rem 1.1rem',
                                    background: n.isRead ? 'transparent' : 'var(--terracotta-pale)',
                                    border: 'none', borderBottom: '1px solid var(--border-lt)',
                                    cursor: 'pointer', transition: 'background .12s',
                                    display: 'flex', alignItems: 'flex-start', gap: '.75rem',
                                  }}
                                  onMouseEnter={(e) => { if (n.isRead) e.currentTarget.style.background = 'var(--bg-warm)'; }}
                                  onMouseLeave={(e) => { if (n.isRead) e.currentTarget.style.background = 'transparent'; }}
                                >
                                  <div style={{
                                    width: '34px', height: '34px', borderRadius: '50%', flexShrink: 0,
                                    background: n.type === 'new_subscription_request' ? 'var(--terracotta-pale)' : 'var(--herb-pale)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    fontSize: '1rem',
                                    color: n.type === 'new_subscription_request' ? 'var(--terracotta)' : 'var(--herb)',
                                  }}>
                                    {n.type === 'new_subscription_request' ? <Utensils size={16} />
                                      : n.type === 'subscription_approved' ? <CheckCircle2 size={16} />
                                      : n.type === 'subscription_rejected' ? <XCircle size={16} />
                                      : n.type === 'vendor_cancelled' ? <Ban size={16} />
                                      : <Bell size={16} />}
                                  </div>
                                  <div style={{ flex: 1, minWidth: 0 }}>
                                    <p style={{ fontSize: '.82rem', color: 'var(--ink)', fontWeight: n.isRead ? 500 : 700, lineHeight: 1.4 }}>
                                      {n.message}
                                    </p>
                                    <p style={{ fontSize: '.7rem', color: 'var(--ink-4)', marginTop: '.2rem' }}>
                                      {n.createdAt?.toDate?.()?.toLocaleString?.('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) ?? 'Just now'}
                                    </p>
                                  </div>
                                  {!n.isRead && (
                                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--terracotta)', flexShrink: 0, marginTop: '.3rem' }} />
                                  )}
                                </button>
                              ))
                            )}
                          </div>

                          {/* Footer */}
                          <div style={{ padding: '.6rem 1rem', borderTop: '1px solid var(--border-lt)', textAlign: 'center' }}>
                            <button
                              onClick={() => { setNotifOpen(false); navigate(userRole === 'provider' ? '/dashboard/provider' : '/dashboard/customer'); }}
                              style={{ fontSize: '.78rem', color: 'var(--terracotta)', fontWeight: 700, fontFamily: 'Nunito', background: 'none', border: 'none', cursor: 'pointer' }}
                            >
                              View all requests in dashboard →
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </>
              )}

              {showAuthedUI ? (
                <div style={{ position: 'relative' }} ref={dropdownRef}>
                  {(() => {
                    const displayName = userDoc?.name || currentUser?.displayName || currentUser?.email || '';
                    return (
                  <button
                    onClick={() => setDropdownOpen((o) => !o)}
                    id="avatar-menu-btn"
                    style={{
                      display: 'flex', alignItems: 'center', gap: '.55rem',
                      padding: '.28rem .72rem .28rem .35rem',
                      borderRadius: '999px',
                      border: `1.5px solid ${dropdownOpen ? 'rgba(194,83,42,.30)' : 'var(--border)'}`,
                      background: dropdownOpen ? 'var(--bg-warm)' : 'var(--bg-surface)',
                      boxShadow: dropdownOpen ? 'var(--shadow-sm)' : 'none',
                      cursor: 'pointer', transition: 'all .16s',
                    }}
                  >
                    <div style={{
                      borderRadius: '999px',
                      padding: '2px',
                      background: dropdownOpen
                        ? 'linear-gradient(135deg, var(--terracotta), var(--terracotta-dark))'
                        : 'linear-gradient(135deg, rgba(194,83,42,.22), rgba(201,139,42,.18))',
                    }}>
                      <UserAvatar name={displayName} size={30} />
                    </div>
                    <span style={{
                      fontSize: '.85rem', fontFamily: 'Nunito', fontWeight: 700,
                      color: 'var(--ink)', maxWidth: '90px',
                      overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                    }}>
                      {displayName.split(' ')[0] || 'Me'}
                    </span>
                    <ChevronDown
                      size={13}
                      style={{ color: 'var(--ink-3)', transform: dropdownOpen ? 'rotate(180deg)' : 'none', transition: 'transform .18s' }}
                    />
                  </button>
                    );
                  })()}

                  {dropdownOpen && (
                    <div className="nav-dropdown">
                      {/* User info */}
                      <div style={{ padding: '.95rem 1.1rem', borderBottom: '1px solid var(--border-lt)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '.7rem' }}>
                          <div style={{
                            borderRadius: '999px',
                            padding: '2px',
                            background: 'linear-gradient(135deg, var(--terracotta), var(--terracotta-dark))',
                            flexShrink: 0,
                          }}>
                            <UserAvatar name={userDoc?.name || currentUser?.displayName || currentUser?.email || ''} size={36} />
                          </div>
                          <div style={{ minWidth: 0 }}>
                            <p style={{
                              fontFamily: 'Nunito', fontWeight: 800, fontSize: '.9rem', color: 'var(--ink)',
                              overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                            }}>
                              {userDoc?.name || currentUser?.displayName || 'My Account'}
                            </p>
                            <p style={{
                              fontSize: '.75rem', color: 'var(--ink-3)', marginTop: '.12rem',
                              overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                            }}>
                              {currentUser.email}
                            </p>
                          </div>
                        </div>
                        <span style={{
                          display: 'inline-flex', alignItems: 'center', gap: '.25rem', marginTop: '.55rem',
                          padding: '.18rem .6rem', borderRadius: '999px',
                          fontSize: '.72rem', fontWeight: 700, fontFamily: 'Nunito',
                          background: userRole === 'provider' ? 'var(--terracotta-pale)' : 'var(--herb-pale)',
                          color: userRole === 'provider' ? 'var(--terracotta)' : 'var(--herb)',
                        }}>
                          {userRole === 'provider' ? <><ChefHat size={13} /> Provider</> : <><User size={13} /> Customer</>}
                        </span>
                      </div>
                      <div style={{ padding: '.3rem 0' }}>
                        <Link to={dashPath} className="nav-dropdown-item" onClick={() => setDropdownOpen(false)}>
                          <LayoutDashboard size={14} /> Dashboard
                        </Link>
                        <Link to="/profile" className="nav-dropdown-item" onClick={() => setDropdownOpen(false)}>
                          <User size={14} /> My Profile
                        </Link>
                      </div>
                      <div style={{ borderTop: '1px solid var(--border-lt)', padding: '.3rem 0' }}>
                        <button onClick={handleLogout} className="nav-dropdown-item danger" style={{ width: '100%' }}>
                          <LogOut size={14} /> Sign Out
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div style={{ display: 'flex', alignItems: 'center', gap: '.7rem' }}>
                  {/* Prevent one-frame guest↔user layout swap on refresh */}
                  {showGuestUI ? (
                    <>
                      <Link to="/login" className="btn-secondary" style={{ padding: '.48rem 1.05rem', fontSize: '.875rem' }}>
                        Login
                      </Link>
                      <Link to="/signup" className="btn-primary" style={{ padding: '.54rem 1.18rem', fontSize: '.875rem' }}>
                        Start Free
                      </Link>
                    </>
                  ) : (
                    <div style={{ width: '162px', height: '38px' }} />
                  )}
                </div>
              )}
            </div>

            {/* ── Mobile hamburger ── */}
            <button
              onClick={() => setMobileOpen((o) => !o)}
              className="nav-mobile"
              style={{
                padding: '.5rem', borderRadius: '.6rem',
                background: mobileOpen ? 'rgba(255,255,255,.2)' : 'rgba(255,255,255,.08)',
                border: '1px solid var(--border)', cursor: 'pointer', color: 'var(--ink)',
                alignItems: 'center', justifyContent: 'center',
              }}
            >
              {mobileOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </nav>

      {/* ── Mobile drawer ── */}
      {mobileOpen && (
        <div
          style={{ position: 'fixed', inset: 0, zIndex: 39, background: 'rgba(42,26,14,.35)', backdropFilter: 'blur(2px)' }}
          onClick={() => setMobileOpen(false)}
        />
      )}
      <div
        className="nav-mobile"
        style={{
          position: 'fixed', top: '72px', left: 0, right: 0,
          background: '#fff', zIndex: 39,
          borderBottom: '1px solid var(--border)',
          boxShadow: '0 8px 24px rgba(42,26,14,.12)',
          transform: mobileOpen ? 'translateY(0)' : 'translateY(-110%)',
          transition: 'transform .25s ease',
          maxHeight: 'calc(100vh - 72px)', overflowY: 'auto',
        }}
      >
        <div className="page-container" style={{ paddingTop: '1rem', paddingBottom: '1.5rem' }}>
          {showAuthedUI && (
            <div style={{
              display: 'flex', alignItems: 'center', gap: '.75rem',
              padding: '.9rem 1rem', background: 'var(--bg-warm)', borderRadius: '1rem', marginBottom: '.75rem',
              border: '1px solid var(--border-lt)',
            }}>
              <UserAvatar name={userDoc?.name || currentUser?.displayName || currentUser?.email || ''} size={40} />
              <div>
                <p style={{ fontFamily: 'Nunito', fontWeight: 800, fontSize: '.9rem', color: 'var(--ink)' }}>{userDoc?.name}</p>
                <p style={{ fontSize: '.75rem', color: 'var(--ink-3)' }}>
                  {userRole === 'provider' ? 'Provider' : 'Customer'}
                </p>
              </div>
            </div>
          )}

            {[
              { to: '/providers', label: 'Browse Tiffins', icon: Utensils, show: true },
              { to: dashPath,     label: 'Dashboard',      icon: LayoutDashboard, show: showAuthedUI },
              { to: '/profile',   label: 'My Profile',     icon: User, show: showAuthedUI },
              { to: '/signup',    label: 'Become a Provider', icon: ChefHat, show: showGuestUI },
            ].filter((l) => l.show).map((l) => (
            <Link
              key={l.to}
              to={l.to}
              onClick={() => setMobileOpen(false)}
              style={{
                padding: '.8rem 1rem', borderRadius: '.85rem',
                fontFamily: 'Nunito', fontWeight: 700, fontSize: '.9rem',
                color: isActive(l.to) ? 'var(--terracotta)' : 'var(--ink-2)',
                background: isActive(l.to) ? 'var(--terracotta-pale)' : 'transparent',
                textDecoration: 'none', marginBottom: '.2rem', transition: 'background .14s',
                display: 'flex', alignItems: 'center', gap: '.6rem',
              }}
            >
                <l.icon size={16} />
                {l.label}
            </Link>
          ))}

          <a
            href="#how-it-works"
            onClick={(event) => {
              setMobileOpen(false);
              handleHowItWorks(event);
            }}
            style={{
              padding: '.8rem 1rem', borderRadius: '.85rem',
              fontFamily: 'Nunito', fontWeight: 700, fontSize: '.9rem',
              color: 'var(--ink-2)',
              background: 'transparent',
              textDecoration: 'none', marginBottom: '.2rem', transition: 'background .14s',
              display: 'flex', alignItems: 'center', gap: '.6rem',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--bg-warm)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
          >
            <UtensilsCrossed size={16} />
            How it Works
          </a>

          <div style={{ borderTop: '1px solid var(--border-lt)', marginTop: '.75rem', paddingTop: '.75rem' }}>
            {showAuthedUI ? (
              <button
                onClick={() => { setMobileOpen(false); handleLogout(); }}
                style={{
                  width: '100%', textAlign: 'left',
                  padding: '.8rem 1rem', borderRadius: '.85rem',
                  fontFamily: 'Nunito', fontWeight: 700, fontSize: '.9rem',
                  color: 'var(--err)', background: 'transparent', border: 'none', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', gap: '.6rem',
                }}
              >
                <LogOut size={16} />
                Sign Out
              </button>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '.5rem' }}>
                {showGuestUI ? (
                  <>
                    <Link to="/login" onClick={() => setMobileOpen(false)} className="btn-secondary" style={{ justifyContent: 'center' }}>Login</Link>
                    <Link to="/signup" onClick={() => setMobileOpen(false)} className="btn-primary" style={{ justifyContent: 'center' }}>Start Free</Link>
                  </>
                ) : (
                  <div style={{ height: '92px' }} />
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
