from app import db

class Practica(db.Model):
    __tablename__ = 'practicas'
    
    id = db.Column(db.Integer, primary_key=True)
    estudiante_id = db.Column(db.Integer, db.ForeignKey('estudiantes.id'), nullable=False)
    tipo_practica = db.Column(db.String(100), nullable=False)
    empresa = db.Column(db.String(200), nullable=False)
    fecha_inicio = db.Column(db.Date, nullable=False)
    fecha_termino = db.Column(db.Date, nullable=False)
    supervisor = db.Column(db.String(200), nullable=False)
    contacto_supervisor = db.Column(db.String(200), nullable=False)
    nota = db.Column(db.Float, nullable=True)
    carta_supervisor = db.Column(db.String(255), nullable=True)
    certificado_alumno = db.Column(db.String(255), nullable=True)
    formulario_inscripcion = db.Column(db.String(255), nullable=True)
    autorizacion_empresa = db.Column(db.String(255), nullable=True)
    
    # Relación
    estudiante = db.relationship('Estudiante', foreign_keys=[estudiante_id])
    
    def to_dict(self):
        return {
            'id': self.id,
            'estudiante_id': self.estudiante_id,
            'tipo_practica': self.tipo_practica,
            'empresa': self.empresa,
            'fecha_inicio': self.fecha_inicio.isoformat(),
            'fecha_termino': self.fecha_termino.isoformat(),
            'supervisor': self.supervisor,
            'contacto_supervisor': self.contacto_supervisor,
            'nota': self.nota,
            'carta_supervisor': self.carta_supervisor,
            'certificado_alumno': self.certificado_alumno,
            'formulario_inscripcion': self.formulario_inscripcion,
            'autorizacion_empresa': self.autorizacion_empresa
        }