import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import {
  Upload, FileDown, CheckCircle, Loader2, Download, RefreshCw, Trash2,
} from "lucide-react";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";

import { resultsApi, type ResultItem } from "@/lib/addResultApi";
import { fetchCourses, type CourseLite } from "@/lib/coursesLite";

// ---------- Helpers ----------
const SEMESTERS = ["Semester I", "Semester II"] as const;
type Semester = (typeof SEMESTERS)[number];

const YEARS = (() => {
  const y = new Date().getFullYear();
  return Array.from({ length: 8 }, (_, i) => String(y + 1 - i));
})();

function toNumber(v: string | number | undefined | null): number | null {
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

// minimal CSV
function parseCsv(text: string): Array<Record<string, string>> {
  const lines = text.split(/\r?\n/).filter((l) => l.trim().length > 0);
  if (!lines.length) return [];
  const header = splitCsvLine(lines[0]);
  const rows: Array<Record<string, string>> = [];
  for (let i = 1; i < lines.length; i++) {
    const cells = splitCsvLine(lines[i]);
    const row: Record<string, string> = {};
    header.forEach((h, idx) => (row[h] = (cells[idx] ?? "").trim()));
    rows.push(row);
  }
  return rows;
}
function splitCsvLine(line: string): string[] {
  const out: string[] = [];
  let cur = "";
  let inQ = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === `"`) {
      if (inQ && line[i + 1] === `"`) { cur += `"`; i++; }
      else { inQ = !inQ; }
    } else if (ch === "," && !inQ) {
      out.push(cur); cur = "";
    } else cur += ch;
  }
  out.push(cur);
  return out.map((s) => s.replace(/^\s+|\s+$/g, ""));
}

// Helper function to calculate grade from marks
const calculateGrade = (marks: number | string): string => {
  const score = typeof marks === 'string' ? parseFloat(marks) : marks;
  if (isNaN(score)) return '-';
  
  if (score >= 75) return 'A';
  if (score >= 65) return 'B';
  if (score >= 50) return 'C';
  if (score >= 35) return 'D';
  return 'F';
};

// ---------- Component ----------
export default function AddResults() {
  // Courses (subjects)
  const [courses, setCourses] = useState<CourseLite[]>([]);
  const [loadingCourses, setLoadingCourses] = useState(true);

  // Single add form state
  const [courseId, setCourseId] = useState<number | null>(null);
  const [studentId, setStudentId] = useState<string>("");
  const [semester, setSemester] = useState<Semester>("Semester I");
  const [year, setYear] = useState<string>(YEARS[0]);
  const [marks, setMarks] = useState<string>("");
  const [remarks, setRemarks] = useState<string>("");
  const [saving, setSaving] = useState(false);

  // Bulk upload state
  const [uploadCourseId, setUploadCourseId] = useState<number | null>(null);
  const [uploadSemester, setUploadSemester] = useState<Semester>("Semester I");
  const [uploadYear, setUploadYear] = useState<string>(YEARS[0]);
  const [previewRows, setPreviewRows] = useState<Array<{ student_id: number; marks: number; remarks?: string }>>([]);
  const [uploading, setUploading] = useState(false);

  // Results list state
  const [listCourseId, setListCourseId] = useState<number | "All">("All");
  const [listSemester, setListSemester] = useState<Semester | "All">("All");
  const [listYear, setListYear] = useState<string | "All">("All");
  const [listStudentId, setListStudentId] = useState<string>("");
  const [rows, setRows] = useState<ResultItem[]>([]);
  const [meta, setMeta] = useState<{ current_page: number; last_page: number; total: number } | null>(null);
  const [loadingList, setLoadingList] = useState(false);
  const [page, setPage] = useState(1);
  const perPage = 10;

  // Delete state
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [targetId, setTargetId] = useState<number | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  // Load subjects from DB
  useEffect(() => {
    (async () => {
      try {
        setLoadingCourses(true);
        const list: CourseLite[] = await fetchCourses();
        setCourses(list);
        if (!courseId && list.length) setCourseId(list[0].id);
        if (!uploadCourseId && list.length) setUploadCourseId(list[0].id);
      } catch {
        toast.error("Failed to load courses");
      } finally {
        setLoadingCourses(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const courseOptions = useMemo(
    () => courses.map((c) => ({ value: String(c.id), label: `${c.title} (${c.code})` })),
    [courses]
  );

  // ---------- Single submit ----------
  async function handleSubmitSingle() {
    const sid = toNumber(studentId);
    const mks = toNumber(marks);
    if (!courseId) return toast.error("Please select a subject");
    if (!sid) return toast.error("Enter a valid Student ID (numeric)");
    if (!mks && mks !== 0) return toast.error("Enter marks/percentage as a number");
    if (!semester || !year) return toast.error("Select semester and year");

    // Format academic year as YYYY-YYYY
    const academicYear = `${year}-${parseInt(year) + 1}`;

    try {
      setSaving(true);
      await resultsApi.create({
        student_id: sid,
        course_id: courseId,
        semester,
        academic_year: academicYear,
        marks: mks,
        remarks: remarks || null,
      });
      toast.success("Result added successfully");
      setStudentId(""); setMarks(""); setRemarks("");
      setPage(1);
      await fetchResults(1);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to add result");
    } finally {
      setSaving(false);
    }
  }

  // ---------- Template & upload ----------
  function downloadTemplate() {
    const header = ["student_id", "marks", "remarks"];
    const sample = [
      ["101", "92", "Excellent performance"],
      ["102", "78", ""],
    ];
    const csv = [header, ...sample].map(r => r.map(v => `"${String(v).replace(/"/g,'""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "results_upload_template.csv";
    a.click();
    URL.revokeObjectURL(url);
  }

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const text = String(reader.result || "");
      const parsed = parseCsv(text);
      const rows = parsed
        .map((r) => {
          const sid = toNumber(r["student_id"]);
          const mk = toNumber(r["marks"]);
          if (!sid || (!mk && mk !== 0)) return null;
          return { student_id: sid, marks: mk, remarks: r["remarks"] || undefined };
        })
        .filter(Boolean) as Array<{ student_id: number; marks: number; remarks?: string }>;
      setPreviewRows(rows);
      toast.success(`Parsed ${rows.length} row(s)`);
    };
    reader.readAsText(file);
  }

  async function commitUpload() {
    if (!uploadCourseId) return toast.error("Select a subject for upload");
    if (!uploadSemester || !uploadYear) return toast.error("Select semester and year");
    if (!previewRows.length) return toast.error("No rows to upload");

    // Format academic year as YYYY-YYYY
    const academicYear = `${uploadYear}-${parseInt(uploadYear) + 1}`;

    try {
      setUploading(true);
      await resultsApi.bulkCreate(
        previewRows.map((r) => ({
          student_id: r.student_id,
          course_id: uploadCourseId,
          semester: uploadSemester,
          academic_year: academicYear,
          marks: r.marks,
          remarks: r.remarks ?? null,
        }))
      );
      toast.success("Bulk upload complete");
      setPreviewRows([]);
      setPage(1);
      await fetchResults(1);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Bulk upload failed");
    } finally {
      setUploading(false);
    }
  }

  // ---------- Results viewer ----------
  async function fetchResults(goToPage?: number) {
    try {
      setLoadingList(true);
      const _page = goToPage ?? page;
      const params: Parameters<typeof resultsApi.list>[0] = { page: _page, per_page: perPage };
      if (listCourseId !== "All") params.course_id = Number(listCourseId);
      if (listSemester !== "All") params.semester = listSemester;
      if (listYear !== "All") params.academic_year = listYear;
      const sid = toNumber(listStudentId);
      if (sid) params.student_id = sid;

      const res = await resultsApi.list(params);
      setRows(res.data);
      setMeta(res.meta);
    } catch {
      toast.error("Failed to load results");
    } finally {
      setLoadingList(false);
    }
  }

  // initial load + when filters/page change
  useEffect(() => { setPage(1); }, [listCourseId, listSemester, listYear, listStudentId]);
  useEffect(() => { fetchResults(); }, [page, listCourseId, listSemester, listYear, listStudentId]);

  function exportCsvCurrentPage() {
    const header = ["ID","Student","Student ID","Course","Code","Credits","Semester","Year","Marks","Grade Pt"];
    const lines = rows.map((r) => [
      r.id,
      r.student?.name ?? "",
      r.student_id,
      r.course?.title ?? "",
      r.course?.code ?? "",
      r.course?.credits ?? "",
      r.semester,
      r.academic_year,
      r.marks,
      r.grade?.grade_point ?? "",
    ]);
    const csv = [header, ...lines].map(a => a.map(x => `"${String(x ?? "").replace(/"/g,'""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `results_page_${page}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  const gradeLabel = (r: ResultItem) => (r.grade?.letter || (r.grade as any)?.name || "").toString();

  // ---------- Delete handlers ----------
  function requestDelete(id: number) {
    setTargetId(id);
    setConfirmOpen(true);
  }

  async function confirmDelete() {
    if (!targetId) return;
    try {
      setDeletingId(targetId);
      await resultsApi.destroy(targetId);
      toast.success("Result deleted");

      // If this was the last row on the page and not page 1, go back a page
      const isLastRow = rows.length === 1;
      if (isLastRow && meta && page > 1) {
        const prev = page - 1;
        setPage(prev);
        await fetchResults(prev);
      } else {
        await fetchResults();
      }
    } catch {
      toast.error("Failed to delete result");
    } finally {
      setDeletingId(null);
      setTargetId(null);
      setConfirmOpen(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Add Student Results (Subject-wise)</h1>
          <p className="text-muted-foreground">Create a single result or upload many via CSV. Grades are computed on the server from marks.</p>
        </div>
      </div>

      {/* Single Entry */}
      <Card className="shadow-soft">
        <CardHeader className="pb-2"><CardTitle>Single Result</CardTitle></CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label>Subject</Label>
            <Select
              value={courseId ? String(courseId) : undefined}
              onValueChange={(v) => setCourseId(Number(v))}
              disabled={loadingCourses || !courses.length}
            >
              <SelectTrigger><SelectValue placeholder={loadingCourses ? "Loading..." : "Select subject"} /></SelectTrigger>
              <SelectContent>
                {courseOptions.map((o) => (<SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Student ID (numeric)</Label>
            <Input inputMode="numeric" placeholder="e.g., 101" value={studentId} onChange={(e)=>setStudentId(e.target.value)} />
            <p className="text-xs text-muted-foreground">Must match an existing <code>users.id</code> with role=student.</p>
          </div>

          <div className="space-y-2">
            <Label>Marks / Percentage</Label>
            <Input type="number" step="0.01" placeholder="e.g., 87.5" value={marks} onChange={(e)=>setMarks(e.target.value)} />
            <p className="text-xs text-muted-foreground">Grade is auto-calculated by the server.</p>
          </div>

          <div className="space-y-2">
            <Label>Semester</Label>
            <Select value={semester} onValueChange={(v: Semester)=>setSemester(v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{SEMESTERS.map((s)=>(<SelectItem key={s} value={s}>{s}</SelectItem>))}</SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Academic Year</Label>
            <Select value={year} onValueChange={(v)=>setYear(v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{YEARS.map((y)=>(<SelectItem key={y} value={y}>{y}</SelectItem>))}</SelectContent>
            </Select>
          </div>

          <div className="space-y-2 md:col-span-3">
            <Label>Remarks (optional)</Label>
            <Textarea placeholder="Any notes about this result…" value={remarks} onChange={(e)=>setRemarks(e.target.value)} className="min-h-[90px]" />
          </div>

          <div className="md:col-span-3 flex items-center justify-end gap-2">
            <Button variant="outline" onClick={()=>{ setStudentId(""); setMarks(""); setRemarks(""); }}>
              Reset
            </Button>
            <Button onClick={handleSubmitSingle} disabled={saving || loadingCourses || !courses.length}>
              {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <CheckCircle className="w-4 h-4 mr-2" />}
              Save Result
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Bulk Upload */}
      <Card className="shadow-soft">
        <CardHeader className="pb-2"><CardTitle>Bulk Upload (CSV)</CardTitle></CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label>Subject</Label>
              <Select
                value={uploadCourseId ? String(uploadCourseId) : undefined}
                onValueChange={(v) => setUploadCourseId(Number(v))}
                disabled={loadingCourses || !courses.length}
              >
                <SelectTrigger><SelectValue placeholder={loadingCourses ? "Loading..." : "Select subject"} /></SelectTrigger>
                <SelectContent>
                  {courseOptions.map((o)=>(<SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Semester</Label>
              <Select value={uploadSemester} onValueChange={(v: Semester)=>setUploadSemester(v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{SEMESTERS.map((s)=>(<SelectItem key={s} value={s}>{s}</SelectItem>))}</SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Academic Year</Label>
              <Select value={uploadYear} onValueChange={(v)=>setUploadYear(v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{YEARS.map((y)=>(<SelectItem key={y} value={y}>{y}</SelectItem>))}</SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>CSV File</Label>
              <Input type="file" accept=".csv" onChange={handleFile} />
              <div className="flex gap-2 mt-1">
                <Button variant="ghost" size="sm" className="gap-2" onClick={downloadTemplate}>
                  <FileDown className="w-4 h-4" /> Template
                </Button>
              </div>
              <p className="text-xs text-muted-foreground mt-1">Columns: <code>student_id</code>, <code>marks</code>, <code>remarks</code></p>
            </div>
          </div>

          <Separator className="my-4" />

          <div className="space-y-2">
            <p className="text-sm font-medium">Preview ({previewRows.length})</p>
            <div className="max-h-64 overflow-auto rounded border">
              <table className="w-full text-sm">
                <thead className="sticky top-0 bg-muted/40">
                  <tr>
                    <th className="p-2 text-left">Student ID</th>
                    <th className="p-2 text-left">Marks</th>
                    <th className="p-2 text-left">Remarks</th>
                  </tr>
                </thead>
                <tbody>
                  {previewRows.length ? previewRows.map((r, idx)=>(
                    <tr key={idx} className="border-t">
                      <td className="p-2">{r.student_id}</td>
                      <td className="p-2">{r.marks}</td>
                      <td className="p-2">{r.remarks ?? ""}</td>
                    </tr>
                  )):(
                    <tr><td className="p-3 text-muted-foreground" colSpan={3}>No preview</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="mt-4 flex items-center justify-end gap-2">
            <Button variant="outline" onClick={()=>setPreviewRows([])} disabled={!previewRows.length || uploading}>
              Clear Preview
            </Button>
            <Button onClick={commitUpload} disabled={uploading || !previewRows.length || !uploadCourseId}>
              {uploading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Upload className="w-4 h-4 mr-2" />}
              Commit Upload
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Results Viewer */}
      <Card className="shadow-soft">
        <CardHeader className="pb-2 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <CardTitle>Results</CardTitle>
          <div className="flex flex-col md:flex-row gap-2 md:items-center">
            <div className="w-full md:w-[220px]">
              <Label className="text-xs text-muted-foreground">Subject</Label>
              <Select
                value={listCourseId === "All" ? "All" : String(listCourseId)}
                onValueChange={(v)=>setListCourseId(v==="All" ? "All" : Number(v))}
              >
                <SelectTrigger><SelectValue placeholder="All subjects" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="All">All</SelectItem>
                  {courseOptions.map((o)=>(<SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>))}
                </SelectContent>
              </Select>
            </div>

            <div className="w-full md:w-[160px]">
              <Label className="text-xs text-muted-foreground">Semester</Label>
              <Select value={listSemester} onValueChange={(v:any)=>setListSemester(v)}>
                <SelectTrigger><SelectValue placeholder="All" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="All">All</SelectItem>
                  {SEMESTERS.map((s)=>(<SelectItem key={s} value={s}>{s}</SelectItem>))}
                </SelectContent>
              </Select>
            </div>

            <div className="w-full md:w-[140px]">
              <Label className="text-xs text-muted-foreground">Year</Label>
              <Select value={listYear} onValueChange={(v:any)=>setListYear(v)}>
                <SelectTrigger><SelectValue placeholder="All" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="All">All</SelectItem>
                  {YEARS.map((y)=>(<SelectItem key={y} value={y}>{y}</SelectItem>))}
                </SelectContent>
              </Select>
            </div>

            <div className="w-full md:w-[160px]">
              <Label className="text-xs text-muted-foreground">Student ID</Label>
              <Input placeholder="e.g., 101" value={listStudentId} onChange={(e)=>setListStudentId(e.target.value)} />
            </div>

            <div className="flex gap-2 pt-1 md:pt-6">
              <Button variant="outline" className="gap-2" onClick={() => { setListCourseId("All"); setListSemester("All"); setListYear("All"); setListStudentId(""); }}>
                Clear
              </Button>
              <Button variant="outline" className="gap-2" onClick={()=>fetchResults(1)}>
                <RefreshCw className="w-4 h-4" /> Refresh
              </Button>
              <Button className="gap-2" variant="outline" onClick={exportCsvCurrentPage}>
                <Download className="w-4 h-4" /> Export
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          {loadingList ? (
            <div className="p-6 flex items-center gap-2 text-sm">
              <Loader2 className="w-4 h-4 animate-spin" /> Loading…
            </div>
          ) : rows.length === 0 ? (
            <div className="p-10 text-center text-muted-foreground">No results match the current filters.</div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-muted/40 sticky top-0">
                    <tr>
                      <th className="text-left px-4 py-2">Student</th>
                      <th className="text-left px-4 py-2">Student ID</th>
                      <th className="text-left px-4 py-2">Course</th>
                      <th className="text-left px-4 py-2">Code</th>
                      <th className="text-center px-4 py-2">Credits</th>
                      <th className="text-center px-4 py-2">Semester</th>
                      <th className="text-center px-4 py-2">Year</th>
                      <th className="text-right px-4 py-2">Marks</th>
                      <th className="text-left px-4 py-2">Grade</th>
                      <th className="text-right px-4 py-2">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((r)=>(
                      <tr key={r.id} className="border-t">
                        <td className="px-4 py-2">{r.student?.name ?? "-"}</td>
                        <td className="px-4 py-2">{r.student_id}</td>
                        <td className="px-4 py-2">{r.course?.title ?? "-"}</td>
                        <td className="px-4 py-2">{r.course?.code ?? "-"}</td>
                        <td className="px-4 py-2 text-center">{r.course?.credits ?? "-"}</td>
                        <td className="px-4 py-2 text-center">{r.semester}</td>
                        <td className="px-4 py-2 text-center">{r.academic_year}</td>
                        <td className="px-4 py-2 text-right">{r.marks}</td>
                        <td className="px-4 py-2">{r.grade?.letter || r.grade?.name || (r.marks ? calculateGrade(r.marks) : "-")}</td>
                        <td className="px-4 py-2 text-right">
                          <Button
                            variant="destructive"
                            size="sm"
                            className="gap-1"
                            onClick={() => requestDelete(r.id)}
                            disabled={deletingId === r.id}
                            aria-label={`Delete result #${r.id}`}
                          >
                            {deletingId === r.id ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <Trash2 className="w-4 h-4" />
                            )}
                            Delete
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {meta && (
                <div className="px-4 py-3 flex items-center justify-between text-sm">
                  <div>Page {meta.current_page} of {meta.last_page} • Total {meta.total}</div>
                  <div className="flex gap-2">
                    <Button variant="outline" disabled={meta.current_page <= 1} onClick={()=>setPage(p=>p-1)}>Prev</Button>
                    <Button variant="outline" disabled={meta.current_page >= meta.last_page} onClick={()=>setPage(p=>p+1)}>Next</Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Confirm Delete Dialog */}
      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this result?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. The result will be permanently removed from the database.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deletingId !== null}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} disabled={deletingId !== null}>
              {deletingId !== null ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Trash2 className="w-4 h-4 mr-2" />}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
