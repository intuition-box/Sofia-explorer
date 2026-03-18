interface PageHeaderProps {
  color: string
  glow: string
  title: string
  subtitle?: string
}

export default function PageHeader({ color, glow, title, subtitle }: PageHeaderProps) {
  return (
    <div
      style={{
        position: 'relative',
        overflow: 'hidden',
        padding: '32px 20px 40px',
        background: color,
        borderRadius: 14,
      }}
    >
      <div
        style={{
          fontSize: 60,
          fontWeight: 900,
          color: '#1a1a1a',
          lineHeight: 1,
          position: 'relative',
          zIndex: 2,
        }}
      >
        {title}
      </div>
      {subtitle && (
        <div
          style={{
            fontSize: 14,
            color: 'rgba(0, 0, 0, 0.5)',
            marginTop: 8,
            position: 'relative',
            zIndex: 2,
          }}
        >
          {subtitle}
        </div>
      )}
      {/* Decorative square */}
      <div
        style={{
          position: 'absolute',
          right: -20,
          top: '50%',
          transform: 'translateY(-50%) rotate(-12deg)',
          width: 180,
          height: 180,
          borderRadius: 20,
          background: 'rgba(0, 0, 0, 0.15)',
          zIndex: 1,
        }}
      />
    </div>
  )
}
