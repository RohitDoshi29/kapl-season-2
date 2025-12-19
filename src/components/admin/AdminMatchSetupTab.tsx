import { useState } from 'react';
import { useCricketStore } from '@/hooks/useCricketStore';
import { TeamBadge } from '@/components/cricket/TeamBadge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { PlayCircle, AlertCircle, Trophy, Users } from 'lucide-react';
import { MatchType, MATCH_TYPE_LABELS } from '@/lib/cricketTypes';

interface AdminMatchSetupTabProps {
  onNavigateToScorer: () => void;
}

export default function AdminMatchSetupTab({ onNavigateToScorer }: AdminMatchSetupTabProps) {
  const { getTeamsByGroup, getTeam, startMatch, matchState, teams } = useCricketStore();
  const [selectedGroup, setSelectedGroup] = useState<'A' | 'B'>('A');
  const [team1Id, setTeam1Id] = useState<string>('');
  const [team2Id, setTeam2Id] = useState<string>('');
  const [matchType, setMatchType] = useState<'group' | 'knockout'>('group');
  const [knockoutType, setKnockoutType] = useState<'semi_final_1' | 'semi_final_2' | 'final'>('semi_final_1');
  const [knockoutTeam1Id, setKnockoutTeam1Id] = useState<string>('');
  const [knockoutTeam2Id, setKnockoutTeam2Id] = useState<string>('');

  const groupTeams = getTeamsByGroup(selectedGroup);
  const team1 = team1Id ? getTeam(team1Id) : null;
  const team2 = team2Id ? getTeam(team2Id) : null;
  const knockoutTeam1 = knockoutTeam1Id ? getTeam(knockoutTeam1Id) : null;
  const knockoutTeam2 = knockoutTeam2Id ? getTeam(knockoutTeam2Id) : null;

  const handleGroupChange = (group: 'A' | 'B') => {
    setSelectedGroup(group);
    setTeam1Id('');
    setTeam2Id('');
  };

  const handleStartGroupMatch = () => {
    if (!team1Id || !team2Id) {
      toast.error('Please select both teams');
      return;
    }
    if (team1Id === team2Id) {
      toast.error('Please select different teams');
      return;
    }
    startMatch(selectedGroup, team1Id, team2Id, 'group');
    toast.success('Group match started!');
    onNavigateToScorer();
  };

  const handleStartKnockoutMatch = () => {
    if (!knockoutTeam1Id || !knockoutTeam2Id) {
      toast.error('Please select both teams');
      return;
    }
    if (knockoutTeam1Id === knockoutTeam2Id) {
      toast.error('Please select different teams');
      return;
    }
    // Use 'A' as default group for knockout matches
    startMatch('A', knockoutTeam1Id, knockoutTeam2Id, knockoutType);
    toast.success(`${MATCH_TYPE_LABELS[knockoutType]} started!`);
    onNavigateToScorer();
  };

  const hasActiveMatch = !!matchState.currentMatch;

  if (hasActiveMatch) {
    const activeMatch = matchState.currentMatch!;
    const activeTeam1 = getTeam(activeMatch.team1Id);
    const activeTeam2 = getTeam(activeMatch.team2Id);

    return (
      <div className="max-w-md mx-auto">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-amber-500">
              <AlertCircle className="w-5 h-5" />
              Match In Progress
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              There's already an active match. End the current match before starting a new one.
            </p>
            <div className="text-center text-sm text-muted-foreground mb-2">
              {MATCH_TYPE_LABELS[activeMatch.matchType || 'group']}
            </div>
            <div className="flex items-center justify-center gap-4 py-4">
              {activeTeam1 && <TeamBadge team={activeTeam1} size="md" />}
              <span className="text-xl font-bold">vs</span>
              {activeTeam2 && <TeamBadge team={activeTeam2} size="md" />}
            </div>
            <Button className="w-full" onClick={onNavigateToScorer}>
              Go to Scorer
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>New Match Setup</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <Tabs value={matchType} onValueChange={(v) => setMatchType(v as 'group' | 'knockout')}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="group" className="gap-2">
                <Users className="w-4 h-4" />
                Group Stage
              </TabsTrigger>
              <TabsTrigger value="knockout" className="gap-2">
                <Trophy className="w-4 h-4" />
                Knockout
              </TabsTrigger>
            </TabsList>

            {/* Group Stage Tab */}
            <TabsContent value="group" className="space-y-6 mt-6">
              {/* Group Selection */}
              <div className="space-y-2">
                <Label>Select Group</Label>
                <Select value={selectedGroup} onValueChange={(v) => handleGroupChange(v as 'A' | 'B')}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="A">Group A</SelectItem>
                    <SelectItem value="B">Group B</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Team 1 */}
              <div className="space-y-2">
                <Label>Team 1 (Batting First)</Label>
                <Select value={team1Id} onValueChange={setTeam1Id}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select team" />
                  </SelectTrigger>
                  <SelectContent>
                    {groupTeams.map((team) => (
                      <SelectItem key={team.id} value={team.id} disabled={team.id === team2Id}>
                        <div className="flex items-center gap-2">
                          <div
                            className="w-4 h-4 rounded-full"
                            style={{ backgroundColor: `hsl(${team.primaryColor})` }}
                          />
                          {team.name}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Team 2 */}
              <div className="space-y-2">
                <Label>Team 2</Label>
                <Select value={team2Id} onValueChange={setTeam2Id}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select team" />
                  </SelectTrigger>
                  <SelectContent>
                    {groupTeams.map((team) => (
                      <SelectItem key={team.id} value={team.id} disabled={team.id === team1Id}>
                        <div className="flex items-center gap-2">
                          <div
                            className="w-4 h-4 rounded-full"
                            style={{ backgroundColor: `hsl(${team.primaryColor})` }}
                          />
                          {team.name}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Preview */}
              {team1 && team2 && (
                <div className="py-4 border-t">
                  <p className="text-sm text-muted-foreground mb-3 text-center">Match Preview</p>
                  <div className="flex items-center justify-center gap-4">
                    <TeamBadge team={team1} size="md" />
                    <span className="text-xl font-bold text-primary">vs</span>
                    <TeamBadge team={team2} size="md" />
                  </div>
                </div>
              )}

              <Button
                className="w-full h-12 gap-2"
                onClick={handleStartGroupMatch}
                disabled={!team1Id || !team2Id || team1Id === team2Id}
              >
                <PlayCircle className="w-5 h-5" />
                Start Group Match
              </Button>
            </TabsContent>

            {/* Knockout Tab */}
            <TabsContent value="knockout" className="space-y-6 mt-6">
              {/* Match Type Selection */}
              <div className="space-y-2">
                <Label>Match Type</Label>
                <Select value={knockoutType} onValueChange={(v) => setKnockoutType(v as 'semi_final_1' | 'semi_final_2' | 'final')}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="semi_final_1">
                      <div className="flex items-center gap-2">
                        <Trophy className="w-4 h-4 text-amber-500" />
                        Semi Final 1
                      </div>
                    </SelectItem>
                    <SelectItem value="semi_final_2">
                      <div className="flex items-center gap-2">
                        <Trophy className="w-4 h-4 text-amber-500" />
                        Semi Final 2
                      </div>
                    </SelectItem>
                    <SelectItem value="final">
                      <div className="flex items-center gap-2">
                        <Trophy className="w-4 h-4 text-yellow-500" />
                        Final
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Team 1 (from all teams) */}
              <div className="space-y-2">
                <Label>Team 1 (Batting First)</Label>
                <Select value={knockoutTeam1Id} onValueChange={setKnockoutTeam1Id}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select team" />
                  </SelectTrigger>
                  <SelectContent>
                    {teams.map((team) => (
                      <SelectItem key={team.id} value={team.id} disabled={team.id === knockoutTeam2Id}>
                        <div className="flex items-center gap-2">
                          <div
                            className="w-4 h-4 rounded-full"
                            style={{ backgroundColor: `hsl(${team.primaryColor})` }}
                          />
                          {team.name}
                          <span className="text-xs text-muted-foreground">(Group {team.group})</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Team 2 */}
              <div className="space-y-2">
                <Label>Team 2</Label>
                <Select value={knockoutTeam2Id} onValueChange={setKnockoutTeam2Id}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select team" />
                  </SelectTrigger>
                  <SelectContent>
                    {teams.map((team) => (
                      <SelectItem key={team.id} value={team.id} disabled={team.id === knockoutTeam1Id}>
                        <div className="flex items-center gap-2">
                          <div
                            className="w-4 h-4 rounded-full"
                            style={{ backgroundColor: `hsl(${team.primaryColor})` }}
                          />
                          {team.name}
                          <span className="text-xs text-muted-foreground">(Group {team.group})</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Preview */}
              {knockoutTeam1 && knockoutTeam2 && (
                <div className="py-4 border-t">
                  <p className="text-sm text-muted-foreground mb-1 text-center">
                    {MATCH_TYPE_LABELS[knockoutType]}
                  </p>
                  <div className="flex items-center justify-center gap-4 mt-3">
                    <TeamBadge team={knockoutTeam1} size="md" />
                    <span className="text-xl font-bold text-primary">vs</span>
                    <TeamBadge team={knockoutTeam2} size="md" />
                  </div>
                </div>
              )}

              <Button
                className="w-full h-12 gap-2"
                onClick={handleStartKnockoutMatch}
                disabled={!knockoutTeam1Id || !knockoutTeam2Id || knockoutTeam1Id === knockoutTeam2Id}
              >
                <Trophy className="w-5 h-5" />
                Start {MATCH_TYPE_LABELS[knockoutType]}
              </Button>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
