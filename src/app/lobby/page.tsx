'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/hooks/useAuth'
import { useYahooFantasy } from '@/lib/hooks/useYahooFantasy'
import Link from 'next/link'
import { Search, Trophy, Users, Calendar, Filter } from 'lucide-react'
import styles from './page.module.css'

export default function Lobby() {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <div className="flex-grow py-12">
        <div className={styles.container}>
          <div className="page-header">
            <h1 className="page-title">Challenge Lobby</h1>
            <p className="page-subtitle">Find compatible leagues to challenge</p>
          </div>
          
          {/* Search and Filter */}
          <div className="search-container">
            <div className={styles.searchForm}>
              <div className="input-group">
                <label htmlFor="search" className="sr-only">Search leagues</label>
                <Search className="input-icon" />
                <input
                  type="text"
                  name="search"
                  id="search"
                  className="input-field"
                  placeholder="Search leagues by name or sport"
                />
              </div>
              <div className={styles.filterContainer}>
                <div className={styles.filterGroup}>
                  <label htmlFor="sport" className={styles.filterLabel}>Sport</label>
                  <select
                    id="sport"
                    name="sport"
                    className="select-field"
                  >
                    <option value="">All Sports</option>
                    <option value="football">Football</option>
                    <option value="basketball">Basketball</option>
                    <option value="baseball">Baseball</option>
                    <option value="hockey">Hockey</option>
                  </select>
                </div>
                <div className={styles.filterGroup}>
                  <label htmlFor="teamSize" className={styles.filterLabel}>Team Size</label>
                  <select
                    id="teamSize"
                    name="teamSize"
                    className="select-field"
                  >
                    <option value="">Any Size</option>
                    <option value="8">8 Teams</option>
                    <option value="10">10 Teams</option>
                    <option value="12">12 Teams</option>
                    <option value="14">14 Teams</option>
                  </select>
                </div>
                <div className={styles.filterGroup}>
                  <button
                    type="button"
                    className="btn btn-outline"
                  >
                    <Filter className="w-4 h-4 mr-2" />
                    More Filters
                  </button>
                </div>
              </div>
            </div>
          </div>
          
          {/* League List */}
          <div className="card">
            <div className={styles.leagueItem}>
              <div className={styles.leagueHeader}>
                <div className={styles.leagueInfo}>
                  <div className={styles.leagueIcon}>
                    <Trophy />
                  </div>
                  <div className={styles.leagueDetails}>
                    <h3 className={styles.leagueName}>Touchdown Titans</h3>
                    <div className={styles.leagueMeta}>
                      <Users className={styles.metaIcon} />
                      <span>10 teams</span>
                      <span className={styles.metaSeparator}>•</span>
                      <span>Football</span>
                      <span className={styles.metaSeparator}>•</span>
                      <span>Yahoo</span>
                    </div>
                  </div>
                </div>
                <div className={styles.actionButtons}>
                  <Link
                    href="/lobby/leagues/1"
                    className="btn btn-outline"
                  >
                    View League
                  </Link>
                  <Link
                    href="/lobby/leagues/1/challenge"
                    className="btn btn-primary"
                  >
                    Challenge
                  </Link>
                </div>
              </div>
              <div className={styles.leagueFooter}>
                <div className={styles.footerInfo}>
                  <Calendar className={styles.metaIcon} />
                  <span>Season: 2023-2024</span>
                  <span className={styles.metaSeparator}>•</span>
                  <span>Current Week: 12</span>
                  <span className={styles.metaSeparator}>•</span>
                  <span className={styles.compatible}>Compatible with your Football League</span>
                </div>
              </div>
            </div>
            
            <div className={styles.leagueItem}>
              <div className={styles.leagueHeader}>
                <div className={styles.leagueInfo}>
                  <div className={styles.leagueIcon}>
                    <Trophy />
                  </div>
                  <div className={styles.leagueDetails}>
                    <h3 className={styles.leagueName}>Hoop Dreams</h3>
                    <div className={styles.leagueMeta}>
                      <Users className={styles.metaIcon} />
                      <span>8 teams</span>
                      <span className={styles.metaSeparator}>•</span>
                      <span>Basketball</span>
                      <span className={styles.metaSeparator}>•</span>
                      <span>ESPN</span>
                    </div>
                  </div>
                </div>
                <div className={styles.actionButtons}>
                  <Link
                    href="/lobby/leagues/2"
                    className="btn btn-outline"
                  >
                    View League
                  </Link>
                  <Link
                    href="/lobby/leagues/2/challenge"
                    className="btn btn-primary"
                  >
                    Challenge
                  </Link>
                </div>
              </div>
              <div className={styles.leagueFooter}>
                <div className={styles.footerInfo}>
                  <Calendar className={styles.metaIcon} />
                  <span>Season: 2023-2024</span>
                  <span className={styles.metaSeparator}>•</span>
                  <span>Current Week: 18</span>
                  <span className={styles.metaSeparator}>•</span>
                  <span className={styles.compatible}>Compatible with your Basketball League</span>
                </div>
              </div>
            </div>
            
            <div className={styles.leagueItem}>
              <div className={styles.leagueHeader}>
                <div className={styles.leagueInfo}>
                  <div className={styles.leagueIcon}>
                    <Trophy />
                  </div>
                  <div className={styles.leagueDetails}>
                    <h3 className={styles.leagueName}>Diamond Kings</h3>
                    <div className={styles.leagueMeta}>
                      <Users className={styles.metaIcon} />
                      <span>12 teams</span>
                      <span className={styles.metaSeparator}>•</span>
                      <span>Baseball</span>
                      <span className={styles.metaSeparator}>•</span>
                      <span>Yahoo</span>
                    </div>
                  </div>
                </div>
                <div className={styles.actionButtons}>
                  <Link
                    href="/lobby/leagues/3"
                    className="btn btn-outline"
                  >
                    View League
                  </Link>
                  <Link
                    href="/lobby/leagues/3/challenge"
                    className="btn btn-primary"
                  >
                    Challenge
                  </Link>
                </div>
              </div>
              <div className={styles.leagueFooter}>
                <div className={styles.footerInfo}>
                  <Calendar className={styles.metaIcon} />
                  <span>Season: 2023</span>
                  <span className={styles.metaSeparator}>•</span>
                  <span>Current Week: Off-season</span>
                  <span className={styles.metaSeparator}>•</span>
                  <span className={styles.compatible}>Compatible with your Baseball League</span>
                </div>
              </div>
            </div>
            
            <div className={styles.leagueItem}>
              <div className={styles.leagueHeader}>
                <div className={styles.leagueInfo}>
                  <div className={styles.leagueIcon}>
                    <Trophy />
                  </div>
                  <div className={styles.leagueDetails}>
                    <h3 className={styles.leagueName}>Ice Warriors</h3>
                    <div className={styles.leagueMeta}>
                      <Users className={styles.metaIcon} />
                      <span>14 teams</span>
                      <span className={styles.metaSeparator}>•</span>
                      <span>Hockey</span>
                      <span className={styles.metaSeparator}>•</span>
                      <span>Yahoo</span>
                    </div>
                  </div>
                </div>
                <div className={styles.actionButtons}>
                  <Link
                    href="/lobby/leagues/4"
                    className="btn btn-outline"
                  >
                    View League
                  </Link>
                  <button
                    disabled
                    className="btn btn-disabled"
                  >
                    Not Compatible
                  </button>
                </div>
              </div>
              <div className={styles.leagueFooter}>
                <div className={styles.footerInfo}>
                  <Calendar className={styles.metaIcon} />
                  <span>Season: 2023-2024</span>
                  <span className={styles.metaSeparator}>•</span>
                  <span>Current Week: 20</span>
                  <span className={styles.metaSeparator}>•</span>
                  <span className={styles.incompatible}>No compatible leagues in your account</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 