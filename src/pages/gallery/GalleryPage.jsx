import MediaLibrary from '../../components/gallery/MediaLibrary.jsx'
export default function GalleryPage() {
  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Gallery</h1>
          <p>Upload and manage public images for your blog articles.</p>
        </div>
      </div>
      <div className="card">
        <MediaLibrary />
      </div>
    </div>
  )
}
