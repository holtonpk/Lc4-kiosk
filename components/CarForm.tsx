"use client";
import {useRef, useState} from "react";
import {useRouter} from "next/navigation";
import Image from "next/image";
import {emptyCar, newCarId, saveCar, deleteCar, type Car, type CarSpec} from "@/lib/cars";
import {uploadCarImage, uploadCarVideo, deleteCarFile} from "@/lib/storage";
import ConfirmDialog from "@/components/ConfirmDialog";

type SpecKey = keyof CarSpec;

const SPEC_SECTIONS: {key: SpecKey; label: string; placeholder: string}[] = [
  {key: "engine", label: "Engine", placeholder: "e.g. 3.0L Twin-Turbocharged Flat-Six"},
  {
    key: "drivetrain",
    label: "Drivetrain & Transmission",
    placeholder: "e.g. Rear-Wheel Drive",
  },
  {key: "performance", label: "Performance", placeholder: "e.g. 0–60 mph: 3.6 seconds"},
  {key: "dimensions", label: "Body & Dimensions", placeholder: "e.g. Length: 178.2 in"},
];

function Field({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  hint,
}: {
  label: string;
  value: string | number;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
  hint?: string;
}) {
  return (
    <label className="block">
      <span className="block text-sm font-semibold text-zinc-700 mb-1.5">{label}</span>
      <input
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-xl border border-zinc-300 px-4 py-3 text-lg text-zinc-900 focus:border-zinc-900 focus:outline-none"
      />
      {hint && <span className="block text-xs text-zinc-400 mt-1">{hint}</span>}
    </label>
  );
}

function ListEditor({
  label,
  placeholder,
  items,
  onChange,
}: {
  label: string;
  placeholder: string;
  items: string[];
  onChange: (items: string[]) => void;
}) {
  return (
    <div>
      <span className="block text-sm font-semibold text-zinc-700 mb-1.5">{label}</span>
      <div className="flex flex-col gap-2">
        {items.map((item, i) => (
          <div key={i} className="flex gap-2">
            <input
              value={item}
              placeholder={placeholder}
              onChange={(e) => {
                const next = [...items];
                next[i] = e.target.value;
                onChange(next);
              }}
              className="flex-1 rounded-xl border border-zinc-300 px-4 py-3 text-base text-zinc-900 focus:border-zinc-900 focus:outline-none"
            />
            <button
              type="button"
              onClick={() => onChange(items.filter((_, idx) => idx !== i))}
              className="w-11 rounded-xl border border-zinc-300 text-zinc-500 hover:bg-zinc-50"
              aria-label="Remove"
            >
              ×
            </button>
          </div>
        ))}
      </div>
      <button
        type="button"
        onClick={() => onChange([...items, ""])}
        className="mt-2 text-sm font-semibold text-zinc-700 hover:text-zinc-900"
      >
        + Add Detail
      </button>
    </div>
  );
}

function VideoEditor({
  videos,
  onChange,
  onUpload,
  uploading,
}: {
  videos: {title: string; url: string}[];
  onChange: (videos: {title: string; url: string}[]) => void;
  onUpload: (file: File) => void;
  uploading: boolean;
}) {
  const inputRef = useRef<HTMLInputElement>(null);

  function removeAt(i: number) {
    const removed = videos[i];
    onChange(videos.filter((_, idx) => idx !== i));
    if (removed.url) deleteCarFile(removed.url);
  }

  return (
    <div>
      <div className="flex flex-col gap-4">
        {videos.map((v, i) => (
          <div key={v.url || i} className="flex flex-col sm:flex-row gap-3 rounded-xl border border-zinc-200 p-3">
            <video src={v.url} controls className="w-full sm:w-56 aspect-video rounded-lg bg-black flex-none" />
            <div className="flex-1 flex flex-col gap-2">
              <input
                value={v.title}
                placeholder="Video title, e.g. Test Drive"
                onChange={(e) => {
                  const next = [...videos];
                  next[i] = {...next[i], title: e.target.value};
                  onChange(next);
                }}
                className="rounded-lg border border-zinc-300 px-3 py-2.5 text-base text-zinc-900 focus:border-zinc-900 focus:outline-none"
              />
              <button
                type="button"
                onClick={() => removeAt(i)}
                className="self-start rounded-lg border border-zinc-300 text-zinc-500 px-3 py-1.5 text-sm hover:bg-zinc-50"
              >
                Remove Video
              </button>
            </div>
          </div>
        ))}
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="video/*"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) onUpload(file);
          if (inputRef.current) inputRef.current.value = "";
        }}
        className="hidden"
        id="video-upload"
      />
      <label
        htmlFor="video-upload"
        className="mt-3 inline-block cursor-pointer rounded-xl bg-zinc-900 px-5 py-3 text-base font-semibold text-white hover:bg-zinc-700"
      >
        {uploading ? "Uploading…" : "+ Upload Video"}
      </label>
    </div>
  );
}

export default function CarForm({mode, car}: {mode: "new" | "edit"; car?: Car}) {
  const router = useRouter();
  const [id] = useState(() => car?.id ?? newCarId());
  const [form, setForm] = useState<Omit<Car, "id">>(() => {
    if (car) {
      const {id: _omit, ...rest} = car;
      return rest;
    }
    return emptyCar();
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [uploadingHero, setUploadingHero] = useState(false);
  const [uploadingPhotos, setUploadingPhotos] = useState(false);
  const [uploadingVideo, setUploadingVideo] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const heroInputRef = useRef<HTMLInputElement>(null);
  const photosInputRef = useRef<HTMLInputElement>(null);

  function update<K extends keyof Omit<Car, "id">>(key: K, value: Omit<Car, "id">[K]) {
    setForm((f) => ({...f, [key]: value}));
    setSaved(false);
  }

  function updateSpec(key: SpecKey, items: string[]) {
    setForm((f) => ({...f, specs: {...f.specs, [key]: items}}));
    setSaved(false);
  }

  async function handleHeroChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingHero(true);
    const url = await uploadCarImage(id, file);
    const oldUrl = form.heroImage;
    update("heroImage", url);
    if (oldUrl) await deleteCarFile(oldUrl);
    setUploadingHero(false);
    if (heroInputRef.current) heroInputRef.current.value = "";
  }

  async function handlePhotosAdd(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    setUploadingPhotos(true);
    const urls = await Promise.all(files.map((f) => uploadCarImage(id, f)));
    setForm((f) => ({...f, photos: [...f.photos, ...urls]}));
    setSaved(false);
    setUploadingPhotos(false);
    if (photosInputRef.current) photosInputRef.current.value = "";
  }

  async function removePhoto(url: string) {
    setForm((f) => ({...f, photos: f.photos.filter((p) => p !== url)}));
    setSaved(false);
    await deleteCarFile(url);
  }

  async function handleVideoUpload(file: File) {
    setUploadingVideo(true);
    const url = await uploadCarVideo(id, file);
    setForm((f) => ({...f, videos: [...f.videos, {title: "", url}]}));
    setSaved(false);
    setUploadingVideo(false);
  }

  async function handleSave() {
    setSaving(true);
    await saveCar({id, ...form});
    setSaving(false);
    setSaved(true);
    if (mode === "new") router.replace(`/admin/${id}`);
  }

  async function handleDelete() {
    setDeleting(true);
    await deleteCar(id);
    router.push("/admin");
  }

  const busy = saving || uploadingHero || uploadingPhotos || uploadingVideo;

  return (
    <div className="pb-32">
      <button
        onClick={() => router.push("/admin")}
        className="mb-6 text-sm font-semibold text-zinc-500 hover:text-zinc-900"
      >
        ← Back to All Vehicles
      </button>

      <div className="flex flex-col gap-8">
        {/* Basic info */}
        <section className="rounded-2xl bg-white p-6 shadow">
          <h2 className="text-lg font-bold text-zinc-900 mb-4">Basic Info</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field
              label="Short Name (shown on kiosk cards)"
              value={form.shortName}
              onChange={(v) => update("shortName", v)}
              placeholder="e.g. 911 Spirit 70"
            />
            <Field
              label="Full Model Name"
              value={form.model}
              onChange={(v) => update("model", v)}
              placeholder="e.g. 911 Spirit 70"
            />
            <Field
              label="Year"
              type="number"
              value={form.year}
              onChange={(v) => update("year", Number(v) || 0)}
            />
            <Field
              label="Edition (optional)"
              value={form.edition || ""}
              onChange={(v) => update("edition", v)}
              placeholder="e.g. Heritage Design Series"
            />
            <Field
              label="Production Number (optional)"
              value={form.productionNumber || ""}
              onChange={(v) => update("productionNumber", v)}
              placeholder="e.g. 123/1500"
            />
            <Field
              label="US Count (optional)"
              value={form.usCount || ""}
              onChange={(v) => update("usCount", v)}
              placeholder="e.g. ~300 in the United States"
            />
          </div>
          <div className="mt-4">
            <Field
              label="Tagline"
              value={form.tagline}
              onChange={(v) => update("tagline", v)}
              placeholder="A short line about this car"
            />
          </div>
        </section>

        {/* Hero image */}
        <section className="rounded-2xl bg-white p-6 shadow">
          <h2 className="text-lg font-bold text-zinc-900 mb-4">Main Photo</h2>
          <div className="flex items-center gap-5">
            <div className="relative w-40 h-28 rounded-xl bg-zinc-100 overflow-hidden flex-none">
              {form.heroImage ? (
                <Image src={form.heroImage} alt="" fill className="object-contain" />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center text-xs text-zinc-400 text-center px-2">
                  No photo yet
                </div>
              )}
            </div>
            <div>
              <input
                ref={heroInputRef}
                type="file"
                accept="image/*"
                onChange={handleHeroChange}
                className="hidden"
                id="hero-upload"
              />
              <label
                htmlFor="hero-upload"
                className="inline-block cursor-pointer rounded-xl bg-zinc-900 px-5 py-3 text-base font-semibold text-white hover:bg-zinc-700"
              >
                {uploadingHero ? "Uploading…" : "Change Main Photo"}
              </label>
            </div>
          </div>
        </section>

        {/* Specs */}
        <section className="rounded-2xl bg-white p-6 shadow flex flex-col gap-6">
          <h2 className="text-lg font-bold text-zinc-900">Specifications</h2>
          {SPEC_SECTIONS.map((s) => (
            <ListEditor
              key={s.key}
              label={s.label}
              placeholder={s.placeholder}
              items={form.specs[s.key]}
              onChange={(items) => updateSpec(s.key, items)}
            />
          ))}
        </section>

        {/* Videos */}
        <section className="rounded-2xl bg-white p-6 shadow">
          <h2 className="text-lg font-bold text-zinc-900 mb-4">Videos</h2>
          <VideoEditor
            videos={form.videos}
            onChange={(v) => update("videos", v)}
            onUpload={handleVideoUpload}
            uploading={uploadingVideo}
          />
        </section>

        {/* Photos */}
        <section className="rounded-2xl bg-white p-6 shadow">
          <h2 className="text-lg font-bold text-zinc-900 mb-4">Photos</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-4">
            {form.photos.map((url) => (
              <div key={url} className="relative aspect-video rounded-xl bg-zinc-100 overflow-hidden group">
                <Image src={url} alt="" fill className="object-cover" />
                <button
                  type="button"
                  onClick={() => removePhoto(url)}
                  className="absolute top-2 right-2 w-8 h-8 rounded-full bg-black/70 text-white text-lg flex items-center justify-center hover:bg-black"
                  aria-label="Remove photo"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
          <input
            ref={photosInputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={handlePhotosAdd}
            className="hidden"
            id="photos-upload"
          />
          <label
            htmlFor="photos-upload"
            className="inline-block cursor-pointer rounded-xl bg-zinc-900 px-5 py-3 text-base font-semibold text-white hover:bg-zinc-700"
          >
            {uploadingPhotos ? "Uploading…" : "+ Add Photos"}
          </label>
        </section>

        {mode === "edit" && (
          <button
            type="button"
            onClick={() => setConfirmDelete(true)}
            className="self-start text-sm font-semibold text-red-600 hover:text-red-700"
          >
            Delete This Vehicle
          </button>
        )}
      </div>

      {/* Sticky save bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-zinc-200 px-6 py-4 flex items-center justify-end gap-4 z-30">
        {saved && !busy && (
          <span className="text-green-600 font-semibold">Saved ✓</span>
        )}
        <button
          onClick={handleSave}
          disabled={busy}
          className="rounded-xl bg-[#FF0000] px-8 py-4 text-lg font-semibold text-white shadow hover:bg-red-700 transition-colors disabled:opacity-50"
        >
          {saving ? "Saving…" : "Save Changes"}
        </button>
      </div>

      <ConfirmDialog
        open={confirmDelete}
        title="Delete this vehicle?"
        message={`"${form.shortName || "This vehicle"}" will be permanently removed from the kiosk. This can't be undone.`}
        confirmLabel={deleting ? "Deleting…" : "Yes, Delete It"}
        danger
        onConfirm={handleDelete}
        onCancel={() => setConfirmDelete(false)}
      />
    </div>
  );
}
